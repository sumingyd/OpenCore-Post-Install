# 优化电源管理

## 启用X86PlatformPlugin

因此，在我们根据自己的喜好微调电源管理之前，我们需要首先确保加载了Apple的XCPM核心。请注意，**仅在Haswell和更新的**上支持**，Sandy, Ivy Bridge和AMD cpu的消费者应该参考以下内容:

* [Sandy 和 Ivy Bridge 电源管理](../universal/pm.md#sandy-and-ivy-bridge-power-management)
* [AMD CPU 电源管理](../universal/pm.md#amd-cpu-power-management)

::: details Ivy Bridge 和 Ivy Bridge-E 说明

苹果在macOS Sierra上放弃了对XCPM的支持，所以XCPM只在10.8.5到10.11.6之间被支持。您仍然需要[ssdtPRgen](../universal/pm.md#sandy-and-ivy-bridge-power-management)。

要在10.11或更早的版本中启用XCPM，只需在引导参数中添加`-xcpm`。

:::

首先，抓取[IORegistryExplorer](https://github.com/khronokernel/IORegistryClone/blob/master/ioreg-302.zip)并查找`AppleACPICPU`(注意，如果你使用搜索，IORegistryExplorer不会显示任何找到的子服务。一旦你找到了条目，请确保清除搜索框):

XCPM 发现           |   XCPM 缺失
:-------------------------:|:-------------------------:
![](../images/post-install/pm-md/pm-working.png)  |  ![](../images/post-install/pm-md/pm-not-working.png)

从左边的图片中可以看到，我们附加了X86PlatformPlugin。这意味着苹果的CPU电源管理驱动程序正在工作(CPU的名称并不重要)。如果您看到与右侧图像类似的内容，则可能存在问题。请务必检查以下内容:

* SSDT-PLUG.**aml** 在你的config.plist和EFI/OC/ACPI中是否同时存在和启用
  * 如果你没有这个，请前往[开始使用ACPI](https://sumingyd.github.io/Getting-Started-With-ACPI)了解如何制作它
* 将SSDT-PLUG设置为CPU的第一个线程。你可以通过选择列出的第一个CPU(在我们的例子中是`CP00`)来进行检查，并确保你在属性中看到这一点:

::: tip 提示

macOS 12.3及以上版本不需要SSDT-PLUG。

:::

```
plugin-type | Number | 0x1
```

::: details X99 说明

XCPM不支持Haswell-E和Broadwell-E，这意味着我们需要将CPU ID伪造成一个支持XCPM的模型:

* **Haswell-E**:

  * `Kernel -> Emulate`:
    * Cpuid1Data: `C3060300 00000000 00000000 00000000`
    * Cpuid1Mask: `FFFFFFFF 00000000 00000000 00000000`

* **Broadwell-E**:

  * `Kernel -> Emulate`:
    * Cpuid1Data: `D4060300 00000000 00000000 00000000`
    * Cpuid1Mask: `FFFFFFFF 00000000 00000000 00000000`

:::

## 手动修改电源管理数据

在大多数情况下，macOS自带的CPU电源管理数据可以直接使用。如果您遇到问题，将SMBIOS更改为更适合您的系统的内容将提供不同的数据，并且可能更适合您的用例。在需要手动调优的情况下，大家可以使用CPUFriend注入修改过的电源管理数据，但如果不知道自己在做什么，可能会严重破坏电源管理。

::: warning 警告

在大多数情况下，您不必这样做。请更改您的SMBIOS。

:::

::: tip 提示

这是一个关于如何更改部分电源管理数据的示例。要了解更多信息，请查看[CPUFriend的文档](https://github.com/acidanthera/CPUFriend/blob/master/Instructions.md).

:::

### 使用CPUFriend

首先，我们需要一些东西:

* X86PlatformPlugin 加载
  * 这意味着Sandy Bridge和AMD cpu不支持
* [CPUFriend](https://github.com/acidanthera/CPUFriend/releases)
* [CPUFriendFriend](https://github.com/corpnewt/CPUFriendFriend)

### LFM: 低频模式

现在让我们运行CPUFriendFriend.command:

![](../images/post-install/pm-md/lpm.png)

第一次打开CPUFriendFriend时，会出现一个选择LFM值的提示。这可以看作是CPU的最低值，或者是CPU空闲的最低值。这个值可以极大地帮助睡眠正常工作，因为macOS需要能够轻松地从S3(睡眠)转换到S0(唤醒)。

要确定您的LFM值，您可以:

* 在英特尔的[ARK网站](https://ark.Intel.com/)上查找`TDP-down Frequency`
  * 请注意，大多数cpu没有列出一个值，所以你需要自己确定
* 或选择推荐值:

| Generation | LFM Value | Comment |
| :--- | :--- | :--- |
| Broadwell+ 笔记本 | 08 | 相当于 800Mhz |
| Broadwell+ 桌面 | 0A | 相当于 1000Mhz |
| Haswell/Broadwell HEDT/Server(例如：X99) | 0D | 相当于 1300Mhz |
| Skylake+ HEDT/Server(例如X299) | 0C | 相当于 1200Mhz |

* **注意**:LFM值仅在Broadwell和更新的SMBIOS上可用
* **注2**:这些值并不是固定不变的，每台机器都有其独特的特性，所以你需要试验哪种最适合你的硬件

对于这个例子，我们将使用[i9 7920x](https://ark.Intel.com/content/www/us/en/ark/products/126240/Intel-core-i9-7920x-x-series-processor-16-5m-cache-up-to-4-30-ghz.html)，它具有2.9 GHz的基础时钟，但没有LFM，因此我们将选择1.3 GHz(即。1300 mhz),向上/向下,直到我们找到稳定的方式。

* 请注意，LFM值只是CPU的乘数，因此您需要适当地调整值
  * 例如。除以100，然后转换为十六进制

```sh
echo "obase=16; 13" | bc
```

* 请注意，1.3Ghz时我们使用的是13，而不是1.3

### EPP: 能源性能偏好

![](../images/post-install/pm-md/epp.png)

接下来是能源性能偏好，EPP。这告诉macOS将CPU加速到其完整时钟的速度有多快。`00`会告诉macOS让CPU尽可能快地运行，而`FF`会告诉macOS慢慢来，让CPU在更长的一段时间内逐步上升。根据你正在做的事情和机器上的散热，你可能想要设置一个介于两者之间的东西。下面的图表可能会有所帮助:

| EPP | 速度 |
| :--- | :--- |
| 0x00-0x3F| 最大性能 |
| 0x40-0x7F | 均衡性能 |
| 0x80-0xBF | 均衡功率 |
| 0xC0-0xFF | 最大节能 |

**注意**:只有Skylake和更新的SMBIOS官方支持EPP

### 性能偏差

![](../images/post-install/pm-md/pm-bias.png)

最后一项是帮助macOS确定你想从你的CPU中获得什么样的整体性能。一般的建议取决于您的具体设置，而试验确实有助于确定最适合您的设置。

### 清理

![](../images/post-install/pm-md/done.png)
![](../images/post-install/pm-md/files.png)

一旦完成，你将得到一个cpufrienddataprovider.kext和ssdt_data.aml。你可以根据自己的喜好选择，但我建议使用kext变体，以避免在Windows和Linux中进行数据注入时遇到麻烦。

* **注意**:CPUFriendDataProvider的加载顺序无关紧要，因为它是一个只有plist的kext
* **注2**:CPUFriend导致的唤醒问题可能是由于不正确的电源管理数据造成的。每个系统都是唯一的，所以你需要尝试，直到你得到一个稳定的配置。内核崩溃将显示`Sleep Wake failure in efi`.重用旧版本macOS的电源管理数据也会导致问题，所以如果你更新macOS，请重新创建你的数据。您可以创建多个数据并使用OpenCore的MinKernel/MaxKernel功能，以便为每个macOS版本加载不同的电源管理数据。
* **注3**:如果您选择使用ssdt_data.ml，请注意SSDT-PLUG不再需要。但是这个SSDT的设置在像X99和X299这样的HEDT平台上是有问题的，所以我们强烈推荐使用CPUFriendDataProvider的SSDT-plug.kext代替。

## Sandy 和 Ivy Bridge 电源管理

在Sandy和Ivy Bridge事件中，消费者电脑与苹果XCPM的连接出现了问题。所以为了解决这个问题我们需要创建自己的电源管理表。

我们需要:

* 确保CpuPm和Cpu0Ist表**不会**被删除
* [ssdtPRGen](https://github.com/Piker-Alpha/ssdtPRGen.sh)

最初，在Ivy Bridge部分的设置中，我们建议用户删除他们的CpuPm和Cpu0Ist，以避免AppleIntelCPUPowerManagement.kext的任何问题。但删除这些表会对Windows中的turbo boost产生不利影响。因此，为了解决这个问题，我们希望保留OEM的表，但我们希望添加一个新表，以补充仅针对macOS的数据。所以一旦我们完成创建CPU-PM表,我们会重新添加OEM的CPU ssdt。

首先，获取您的config.plist，然后转到ACPI -> Delete，并确保这两个部分的`Enabled`设置为“YES”:

| Key | Type | Value |
| :--- | :--- | :--- |
| All | Boolean | YES |
| Comment | String | Drop CpuPm |
| Enabled | Boolean | YES |
| OemTableId | Data | 437075506d000000 |
| TableLength | Number | 0 |
| TableSignature | Data | 53534454 |

| Key | Type | Value |
| :--- | :--- | :--- |
| All | Boolean | YES |
| Comment | String | Drop Cpu0Ist |
| Enabled | Boolean | YES |
| OemTableId | Data | 4370753049737400 |
| TableLength | Number | 0 |
| TableSignature | Data | 53534454 |

完成后，重新启动，然后获取ssdtPRGen并运行它:

![](../images/post-install/pm-md/prgen-run.png)

完成后，你将在`/Users/your-name>/Library/ssdtPRGen/ssdt.dsl`下得到一个SSDT.aml, 你可以用快捷键Cmd+Shift+G，然后粘贴`~/Library/ssdtPRGen/`找到它。

![](../images/post-install/pm-md/prgen-done.png)

记住现在将它添加到EFI/OC/ACPI和您的config.plist中，我建议将它重命名为SSDT-PM以更容易找到它。

最后，我们可以禁用之前的ACPI -> Delete条目(' Enabled '设置为NO):

| Key | Type | Value |
| :--- | :--- | :--- |
| All | Boolean | YES |
| Comment | String | Drop CpuPm |
| Enabled | Boolean | NO |
| OemTableId | Data | 437075506d000000 |
| TableLength | Number | 0 |
| TableSignature | Data | 53534454 |

| Key | Type | Value |
| :--- | :--- | :--- |
| All | Boolean | YES |
| Comment | String | Drop Cpu0Ist |
| Enabled | Boolean | NO |
| OemTableId | Data | 4370753049737400 |
| TableLength | Number | 0 |
| TableSignature | Data | 53534454 |

### ssdtPRgen故障诊断

虽然ssdtPRgen试图处理与OEM的SSDT的任何不兼容问题，但您可能会发现它在启动时仍然冲突，因为您的OEM已经在`_INI`或`_DSM`等部分声明了某些设备或方法。

如果你在启动过程中发现，你会从SSDT-PM得到类似这样的错误:

```
ACPI Error: Method parse/execution failed [\_SB._INI] , AE_ALREADY_EXIST
```

这意味着存在一些冲突，为了解决这个问题，我们建议将ssdtPRgen的信息转换成如下格式:

```c
DefinitionBlock ("ssdt.aml", "SSDT", 1, "APPLE ", "CpuPm", 0x00021500)
{
    External (\_PR_.CPU0, DeviceObj) // External Processor definition
    External (\_PR_.CPU1, DeviceObj) // External Processor definition

    Scope (\_PR_.CPU0) // Processor's scope
    {
        Name (APLF, Zero)
        Name (APSN, 0x04)
        Name (APSS, Package (0x20)
        {
            /*  … */
        })

        Method (ACST, 0, NotSerialized)
        {
            /*  … */
        }

        /*  … */
    }
```

请密切关注我们所做的事情:

* 确保 Processor 对象被移动到 external
* 将所有 methods 移动到 Processor's scope 内

要编辑和重新编译SSDT-PM，请参阅这里:[开始使用ACPI](https://sumingyd.github.io/Getting-Started-With-ACPI/)

### BIOS故障诊断

对于某些主板，可能需要确保为CPU电源管理设置了以下BIOS选项:

* C States: `True`
* P States Coordination: `SW_ALL`

## AMD CPU电源管理

虽然macOS可能没有正式支持AMD CPU电源管理，但社区正在努力添加它，特别是[AMDRyzenCPUPowerManagement](https://github.com/trulyspinach/SMCAMDProcessor).

**警告**:这个kext是不稳定的，如果你随机收到内核崩溃或启动问题，请记住这个kext可能是罪魁祸首。
