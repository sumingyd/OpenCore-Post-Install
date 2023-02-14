# 传统的Nvidia补丁

* 请注意，这个页面更像是一个信息转储，我们不会对设置进行太详细的介绍，尽管我们计划为它扩展这个页面。

对于传统的Nvidia GPU，由于许多属性的缺失，macOS很难启用加速功能。为了解决这个问题，我们可以在IOS服务中注入属性，以便于macOS轻松解释。

首先，我们将假设以下情况。

* macOS已经以某种方式被安装了
  * 我们需要安装macOS来确定某些属性
* 你的GPU是Fermi或更早的版本
  * 开普勒和更新的**不需要**设备属性注入
* Lilu和WhateverGreen已经加载
  * 通过运行`kextstat | grep -E "Lilu|WhateverGreen"`来验证。
  
### 找到GPU的路径

首先让我们获取[gfxutil](https://github.com/acidanthera/gfxutil/releases)并运行以下程序：

```
path/to/gfxutil -f display
```

这应该会输出类似以下的东西：

```
67:00.0 10DE:0A20 /PC02@0/BR2A@0/GFX0@0/ = PciRoot(0x2)/Pci(0x0,0x0)/Pci(0x0,0x0)
```

我们关心的是PciRoot部分，因为这是我们的GPU所在的位置，也是我们将注入属性的地方：

```
PciRoot(0x2)/Pci(0x0,0x0)/Pci(0x0,0x0)
```

### 建立我们的设备属性 DeviceProperties

对于Nvidia GPU，实际上没有太多的属性需要进行设置。推荐的主要属性有以下几项：

| Property | Value | Comment |
| :--- | :--- | :--- |
| model | ex. GeForce GT 220 | GPU型号名称，美化 |
| device_type | NVDA,Parent | 始终设置为`NVDA,Parent` |
| VRAM,totalsize | ex. 0000004000000000 | 设置VRAM大小 |
| rom-revision | Dortania | 属性必须存在，但其值可以是任何东西 |
| NVCAP | ex. 0500000000000F00000000000000000F00000000 | 设置macOS使用的显示属性，更多信息见下文 |
| @0,compatible | NVDA,NVMac | 始终设置为 `NVDA,NVMac` |
| @0,device_type | display | 始终设置为 `display` |
| @0,name | NVDA,Display-A | 始终设置为 `NVDA,Display-A` |
| @1,compatible | NVDA,NVMac | 始终设置为 `NVDA,NVMac` |
| @1,device_type | display | 始终设置为 `display` |
| @1,name | NVDA,Display-B | 始终设置为 `NVDA,Display-B` |

并计算出属性的几个属性:

* [model](#model)
* [VRAM,totalsize](#vram-totalsize)
* [rom-revision](#rom-revision)
* [NVCAP](#nvcap)

### model

从技术上讲是美化，但是macOS期望有这个条目，所以我们要提供它。其格式如下：

```md
GeForce [设备名称]
# 示例
GeForce GT 220
```

### VRAM,totalsize

你的卡上存在的VRAM数量，以十六进制表示。

在这个例子中，让我们把1024MB转换成16进制：

```md
# 将1024MB兆字节转换成字节数
echo '1024 * 1024 * 1024' | bc
 1073741824

# 从十进制转换为十六进制
echo 'obase=16; ibase=10; 1073741824' | bc
 40000000

# 十六进制交换，以便能够正确注入
# 即成对地交换
40000000 -> 40 00 00 00 -> 00 00 00 40

# 将值填充到8个字节，最后是00
00 00 00 40 00 00 00 00

# 然后你就完成了
VRAM,totalsize = 0000004000000000
```

### rom-revision

可以是任何值，但该属性必须存在，因为有些GPU在没有它的情况下无法初始化（例如GT 220）

```
rom-revision = Dortania
```

### NVCAP

这就是乐趣所在，因为我们现在需要计算NVCAP值。值得庆幸的是，1Revenger1已经创建了一个工具来自动完成这个过程。[NVCAP计算器](https://github.com/1Revenger1/NVCAP-Calculator/releases)

要使用这个程序，只需获取你的VBIOS（[TechPowerUp主持大多数VBIOS](https://www.techpowerup.com/vgabios/)）并在你的终端运行NVCAP-Calculator。

一旦它运行，你应该看到以下内容

![](../../images/gpu-patching/nvidia/nvcap-start.jpg)

给它你的VBIOS，然后按回车。一旦它带你到主菜单，选择选项2，带你到NVCAP计算页面。

![](../../images/gpu-patching/nvidia/nvcap-initial-nvcap.jpg)

这里你可以看到NVCAP-Calculator能够找到的连接器。每个显示器可能代表多个DCB条目，如DVI（通常表示为两个条目）或重复的DCB条目。这里的目标是将每个显示器分配给一个头。每个头一次只能输出到一个显示器。例如，如果你使用2个DVI端口，每个端口应该在自己的头上，以获得适当的双显示器支持。

请注意，一些显示器可能被自动分配。一个LVDS显示器将被自动放在它自己的头上，而电视显示器将被自动放在电视头上。

要开始分配显示器，按`1`。要把一个显示器分配给一个头，你要输入显示器的号码，然后是头的号码。例如，输入`1 1`的结果是：

![](../../images/gpu-patching/nvidia/nvcap-assign-entry.jpg)

你可以再次输入`1 1`来从头部移除显示器。一旦你完成了对显示器的分配，它应该看起来像这样。

![](../../images/gpu-patching/nvidia/nvcap-complete-displays.jpg)

一旦你完成了显示器的设置，按`q`返回到其他NVCAP设置。你应该按照以下方式设置其余的NVCAP设置：

| NVCAP Value | Details | Example Command |
| :---------: | :------ | :-------------- |
| Version |  `04`适用于7系列及以前的产品，`05`适用于8系列及以后的产品 | `3` 然后 `4` |
| Composite | `01`代表S-视频，否则为`00` | `4` 来切换 |
| Script based Power/Backlight | `00`只适用于真正的MacBook Pros | `3` 来切换 |
| Field F (Unknown) | `0F`适用于300系列和更新的产品，否则`07` | `6` 然后 `0x0f` |

一旦完成，输入`c`来计算NVCAP值

![](../../images/gpu-patching/nvidia/nvcap-calculated.jpg)

现在有了你的NVCAP值!

```
NVCAP: 
05000000 00000300 0c000000 0000000f 00000000
```

对于那些想要了解如何计算NVCAP值的人来说:

::: details NVCAP 列表

Info based off of [WhateverGreen's NVCAP.bt file](https://github.com/acidanthera/WhateverGreen/blob/master/Manual/NVCAP.bt)

| NVCAP Bit | Name | Comment |
| :--- | :--- | :--- |
| Byte 1 | NVCAP Version | `04`代表7系列和更早的版本，`05`代表8系列和更新的版本。 |
| Byte 2 | Laptop with Lid | `01`表示真实，否则为`00` |
| Byte 3 | Composite | `01`代表S-Video, `00`否则 |
| Byte 4 | Backlight | `01`代表带背光的Tesla V1，否则`00`代表较新的GPU，与屏幕类型无关 |
| Bytes 5+6   | TVDCBMask    | `00 00`，与DCB条目5有关 |
| Bytes 7+8   | Head0DCBMask | `00 00`, 见下文 |
| Bytes 9+10  | Head1DCBMask | `00 00`, 见下文 |
| Bytes 11+12 | Head2DCBMask | `00 00`, 不适用于Fermi和更早的版本。 |
| Bytes 13+14 | Head3DCBMask | `00 00`, 不适用于Fermi和更早的版本。 |
| Byte 15 | ScriptBasedPowerAndBacklight| `00`，只适用于真正的MacBook Pro |
| Byte 16 | Unknown |  `0F`适用于300系列和更新的产品，否则`07` |
| Byte 17 | EDID | `00` |
| Byte 18 | Reserved | `00` |
| Byte 19 | Reserved | `00` |
| Byte 20 | Reserved | `00` |

:::

### 清理工作

现在我们已经得到了所有的属性，现在我们可以把它们添加起来，并把它们放在我们的config.plist中:

```
PciRoot(0x2)/Pci(0x0,0x0)/Pci(0x0,0x0)

model          | String | GeForce GT 220
device_type    | String | NVDA,Parent
VRAM,totalsize |  Data  | 0000004000000000
rom-revision   | String | Dortania
NVCAP          |  Data  | 05000000 00000300 0c000000 0000000f 00000000
@0,compatible  | String | NVDA,NVMac
@0,device_type | String | display
@0,name        | String | NVDA,Display-A
@1,compatible  | String | NVDA,NVMac
@1,device_type | String | display
@1,name        | String | NVDA,Display-B
```

打开你的config.plist并前往`DeviceProperties -> Add`，接下来用你的GPU的路径名称创建一个新的子项（即有gfxutil的那个）。然后，最后将这些属性作为子项添加到PciRoot中。你最终应该得到类似的东西。

![](../../images/gpu-patching/nvidia/deviceproperties.png)
