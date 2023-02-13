# USB映射

因此，有了先决条件，我们终于可以开始这篇指南的核心内容了。现在我们终于可以在每晚睡觉前读一本我最喜欢的书:[高级配置和电源接口(ACPI)规范!](https://uefi.org/specs/ACPI/6.4/)

现在，如果你之前没有读过这篇文章(我强烈建议你读，这是一个激动人心的故事)，我将向你指出USB的主要情况:

* 第9.14节:_UPC (USB端口能力)

在这里，我们可以看到ACPI中所有可能的USB端口:

| 类型 | 信息 | 说明 |
| :--- | :--- | :--- |
| 0 | USB 2.0 Type-A连接器 | 这是macOS在没有映射时默认的所有端口 |
| 3 | USB 3.0 Type-A连接器 | 3.0、3.1和3.2端口共享相同的类型 |
| 8 | Type C连接器 - 仅支持USB 2.0 | 主要用于手机
| 9 | Type C连接器 - USB 2.0和USB 3.0和开关 | 翻转设备**不会**改变ACPI端口 |
| 10 | Type C连接器 - USB 2.0和USB 3.0无开关 | 翻转设备**会**改变ACPI端口。一般见于3.1/2主板头 |
| 255 | 专用连接器 | 用于内部USB端口，如蓝牙 |

## USB映射:手动方式

本节是为那些想深入了解黑苹果的人准备的，他们可以真正了解它在做什么，并在USBmap.py和其他映射工具有任何问题时提供帮助。首先，我们需要一些东西:

* macOS的安装版本
  * 这是由于macOS枚举端口的方式，试图从其他操作系统映射会使这变得困难
  * 注:本指南将集中在OS X 10.11, El Capitan和更新。旧的操作系统不需要任何USB映射
* 无冲突的USB名称
  * 请参阅上一节:[检查你需要的重命名](../system-preparation.md#checking-what-renames-you-need)
* 用于测试的USB 2.0和USB 3.0设备
  * 你必须有两个独立的设备，以确保映射的时候系统不会混淆
* [IORegistryExplorer.app](https://github.com/khronokernel/IORegistryClone/blob/master/ioreg-302.zip)
  * 更容易查看macOS的内部工作原理
  * 如果您计划使用Discord进行故障排除，[v2.1.0](https://github.com/khronokernel/IORegistryClone/blob/master/ioreg-210.zip)在文件大小上分辨会更容易一些。
* [USBInjectAll](https://bitbucket.org/RehabMan/os-x-usb-inject-all/downloads/)
  * 这在较旧的USB控制器才需要，如Broadwell和更旧的，但是一些Coffee Lake系统可能仍然需要它
  * **提示**这个kext不能在AMD上工作
* [Sample-USB-Map.kext](https://github.com/dortania/OpenCore-Post-Install/blob/master/extra-files/Sample-USB-Map.kext.zip)
* [ProperTree](https://github.com/corpnewt/ProperTree)
  * 或任何其他plist编辑器
  
现在，所有这些都解决了，让我们进入USB映射!

## 找到你的USB端口

让我们打开之前下载的[IORegistryExplorer.app](https://github.com/khronokernel/IORegistryClone/blob/master/ioreg-302.zip)并搜索我们的USB控制器。

两个主要的搜索词是 `XHC` 和 `EHC`, 但如果你有一个带有UHCI或OHCI控制器的 legacy 板，你就需要调整。一个笼统的 `USB` 搜索可能会显示太多的条目，让你感到困惑。

对于这个例子，让我们尝试映射华硕X299-E Strix主板:

![](../../images/post-install/manual-md/initial-boot.png)

从上图中我们可以看到3个USB控制器:

* PXSX(1, 上)
* PXSX(2, 中)
* XHCI(3, 下)

请注意，它们是独立的控制器，因为这意味着**每个USB控制器都有自己的端口限制**。所以你并不像你想的那样渴望USB端口。

现在我个人知道哪个USB控制器匹配哪个物理端口，问题是它并不总是那么明显的哪个端口匹配哪个控制器。所以我们试着找出哪个是什么。

**注意**:AppleUSBLegacyRoot项列出了所有活动的USB控制器和端口，这些不是USB控制器本身，所以你可以直接忽略它们。

**注2**:请记住，每个主板型号都有一组独特的端口组合、控制器类型和名称。因此，虽然我们的示例使用PXSX，但您的示例可能有XHC0或PTCP名称。在较老的主板上很常见的是，你可能只有一个控制器，这是好的，所以不要强调和例子有完全相同的设置。

你可以查看常用的名称:

* USB 3.x 控制器:
  * XHC
  * XHC0
  * XHC1
  * XHC2
  * XHCI
  * XHCX
  * AS43
  * PTXH
    * 通常与AMD芯片组控制器相关
  * PTCP
    * 在AsRock X399上找到
  * PXSX
    * 这是一个通用的PCIe设备，**仔细检查它是否是USB设备**，因为NVMe控制器和其他设备可以使用相同的名称。
* USB 2.x 控制器:
  * EHCI
  * EHC1
  * EHC2
  * EUSB
  * USBE

### 找出哪个端口与哪个控制器匹配

首先，我要把一个USB设备插入我的USB 3.1(a型)和USB 3.2(c型):

![](../../images/post-install/manual-md/front-io-plugged.png)

接下来让我们看看IOReg，我们可以看到我们的USB设备出现在哪里:

| USB-C | USB-A |
| :--- | :--- |
| ![](../../images/post-install/manual-md/usb-c-test.png) | ![](../../images/post-install/manual-md/usb-a-test-3.png) |

在这里我们看到了一些东西:

* 前3.2类型-c在PXSX(2，中间)控制器上
* 前3.1类型-a在XHCI(3，底部)控制器上

现在我们已经知道了哪个端口连接到哪个控制器，现在可以看看我们如何映射USB了。

### USB-A 映射

如前所述，usb3.x端口分为两种类型:usb2.0和usb3.0。这是为了确保向后兼容，但macOS本身很难确定哪些特型与哪些端口匹配。这就是我们要提供帮助的地方。

所以让我们使用USB-a端口，当我们将USB 3.0设备插入它时，我们看到`XHCI -> SS03`亮起。这是端口的USB 3.0特性。现在我们要在该端口上插入USB 2.0设备:

| 3.0 特型 | 2.0 特型 |
| :--- | :--- |
| ![](../../images/post-install/manual-md/usb-a-test-4.png) | ![](../../images/post-install/manual-md/usb-a-test-2.png) |

我们看到我们的3.0端口的USB 2.0特性是`XHCI -> HS03`，现在你应该能够了解我们试图做什么:

* 正面a型:
  * HS03: 2.0特型
  * SS03: 3.0特型

**注意**:如果你的USB端口显示为AppleUSB20XHCIPort或AppleUSB30XHCIPort，你仍然可以映射，但是会有点困难。与其把名字写下来，不如密切关注右边的`port`属性:

![](../../images/post-install/manual-md/location-id.png)

### 创建个人地图

这就是我们拿出笔和纸，开始写下哪个端口与哪个数字端口相匹配的地方。你的地图可能看起来像这样的一个例子:

| 名称映射 | 属性映射 |
| :--- | :--- |
| ![](../../images/post-install/manual-md/front-io-diagram.png) | ![](../../images/post-install/manual-md/full-diagram-port.png) |

你自己的地图不需要完全像这样，但是你需要一些你很容易理解和参考的东西。

注意:

* 名称映射:当一个正确的名称在IOReg中显示时(例如:HS01)
* 属性映射:当没有给出合适的名称时(例如:AppleUSB30XHCIPort）

### USB-C映射

接下来映射我们的USB-C端口，这是非常棘手的地方，你可能已经注意到了:

| 类型 | 信息 | 说明 |
| :--- | :--- | :--- |
| 8 | Type C连接器 - 仅支持USB 2.0的 | 主要见于手机 |
| 9 | Type C连接器 - USB 2.0和USB 3.0带开关 | 翻动设备**不**改变ACPI接口 |
| 10 | Type C连接器 - USB 2.0和USB 3.0没有开关| | 翻转设备**会**改变ACPI接口。一般见于3.1/2主板头 |

所以当我们映射我们的USB-C头时，我们注意到它占用了SS01端口。但当我们翻转它时，我们实际上是在SS02端口上填充它。当发生这种情况时，你需要在应用端口类型时将其记录下来。

* 注意:该端口的所有特型将被置于10型之下
* 注意2:并非所有USB-C表头都是10，**仔细检查你的表头**

![](../../images/post-install/manual-md/usb-c-test-2.png)

### 继续映射

现在您已经有了基本的想法，您将需要到处查看每个USB端口并将其映射出来。这需要时间，别忘了把它写下来。最终的图表应该类似于下面这样:

![](../../images/post-install/manual-md/full-diagram.png)

### Special Notes

* [蓝牙](#bluetooth)
* [USRx端口](#usrx-ports)
* [没有 USB 端口](#missing-usb-ports)

#### 蓝牙

所以，虽然对很多人来说并不明显，但蓝牙实际上是在内部通过USB接口运行的。这意味着在映射时，你需要密切关注IOReg中已经显示的设备:

![](../../images/post-install/manual-md/bluetooth.png)

请记住这一点，因为这是255类型，并使某些服务(如切换)正常工作。

#### USRx端口

在映射时，您可能会注意到一些剩余的端口，特别是USR1和USR2。这些端口被称为“USBR”端口，或者更具体地说是[USB重定向端口](https://software.Intel.com/content/www/us/en/develop/documentation/amt-developer-guide/top/storage-redirection.html).使用这些设备是为了进行远程管理，但真正的mac没有附带USBR设备，所以在操作系统方面没有对它们的支持。实际上，你可以忽略USB映射表中的这些条目:

![](../../images/post-install/manual-md/usr.png)

#### 缺少USB接口

在一些罕见的情况下，某些USB端口可能根本不显示在macOS中。这可能是由于您的ACPI表中缺少定义，因此我们有几个选择:

* Coffee Lake 及以上应使用 [USBInjectAll](https://github.com/Sniki/OS-X-USB-Inject-All/releases)
  * 不要忘记添加到 EFI/OC/Kexts 和你的 config.plist's kernel -> Add中
* Comet Lake和更新版本应该使用SSDT-RHUB
* AMD系统也应该使用SSDT-RHUB

SSDT-RHUB的目的是重置你的USB控制器，并强制macOS重新枚举它们。这避免了为现有的ACPI表打补丁的麻烦。

创建自己的SSDT-RHUB-MAP:

* 获取SSDT副本: [SSDT-RHUB.dsl](https://github.com/dortania/Getting-Started-With-ACPI/blob/master/extra-files/decompiled/SSDT-RHUB.dsl)
* 获取 [maciASL](https://github.com/acidanthera/MaciASL/releases/tag/1.5.7)

接下来，用maciASL打开我们新下载的SSDT，你应该会看到以下内容:

![](../../images/post-install/manual-md/ssdt-rhub-normal.png)

现在，打开IOReg并找到你想要重置的USB控制器(注意，它是USB控制器，而不是同名的子RHUB):

如果你看右边，你应该会看到`acpi-apth`属性。这里我们需要把它翻译成我们的SSDT可以使用的东西:

```sh
# 修改前
IOService:/AppleACPIPlatformExpert/PC00@0/AppleACPIPCI/RP05@1C,4/IOPP/PXSX@0
```

现在我们要去掉所有不必要的数据:

* `IOService:/AppleACPIPlatformExpert/`
* `@##`
* `IOPP`

一旦清理干净，你的应该看起来类似:

```sh
# 修改后
PC00.RP05.PXSX
```

按照上面的例子，我们将 `PCI0.XHC1.RHUB` 重命名为 `PC00.RP05.PXSX.RHUB`:

**之前**:

```
External (_SB_.PCI0.XHC1.RHUB, DeviceObj) <- 重命名

Scope (_SB.PCI0.XHC1.RHUB) <- 重命名
```

![](../../images/post-install/manual-md/ssdt-rhub.png)

按照我们找到的示例路径，SSDT应该看起来像这样:

**之后**:

```
External (_SB.PC00.RP05.PXSX.RHUB, DeviceObj) <- 重命名

Scope (_SB.PC00.RP05.PXSX.RHUB) <- 重命名
```

![](../../images/post-install/manual-md/ssdt-rhub-fixed.png)

一旦你将SSDT编辑到USB控制器的路径下，你就可以使用`File -> SaveAs -> ACPI Machine Language Binary`将其导出:

![](../../images/post-install/manual-md/ssdt-save.png)

最后，请记住将此SSDT添加到 EFI/OC/ACPI 和你 config.plist 中的 ACPI -> Add.

## 创建kext

大家期待已久的时间到了，我们终于可以创建我们的USB map了!

首先，我们需要获取一个USB map kext示例:

* [Sample-USB-Map.kext](https://github.com/dortania/OpenCore-Post-Install/blob/master/extra-files/Sample-USB-Map.kext.zip)

接下来右键单击.kext，并选择“显示包内容”。然后深入到info.plist:

| 显示内容 | info.plist |
| :--- | :--- |
| ![](../../images/post-install/manual-md/show-contents.png) | ![](../../images/post-install/manual-md/info-plist.png) |

现在让我们打开ProperTree，看看这个info.plist:

![](../../images/post-install/manual-md/info-plist-open.png)

下面我们看到在`iokitpersonality`下的几个部分:

* RP05 - PXSX(1)
* RP07 - PXSX(2)
* XHCI - XHCI

这里的每个条目表示一个USB控制器，特别是每个控制器的映射。然而，条目的名称并不重要，它更重要的是为了好记，以便您知道哪个条目有哪个USB映射。

接下来让我们进入`RP05 - PXSX(1)`条目:

![](../../images/post-install/manual-md/rp05-entry.png)

这里我们看到了一些更重要的属性:

| Property | Comment |
| :--- | :--- |
| IOPathMatch | macOS将选择将map附加到该设备 |
| IOProviderClass | macOS将选择附加的USB驱动程序 |
| model | USB映射也连接了SMBIOS|
| IOProviderMergeProperties | 保存实际端口映射的字典 |

### Determining the properties

Determining the value for each property is actually quite straight forward:

* [IOPathMatch](#iopathmatch)
* [IOProviderClass](#ioproviderclass)
* [model](#model)
* [IOProviderMergeProperties](#ioprovidermergeproperties)

#### IOPathMatch

找到IOPathMatch非常简单，首先找到你想要映射的USB控制器，然后选择根集线器(所以PXSX子集线器与父集线器同名，不要担心，当你查看图像时，它会减少困惑):

![](../../images/post-install/manual-md/iopath-match.png)

现在选择PXSX条目，简单地复制(Cmd+C)并粘贴到我们的info.plist。你的属性应该如下图所示:

```
IOService:/AppleACPIPlatformExpert/PC00@0/AppleACPIPCI/RP05@1C,4/IOPP/PXSX@0/PXSX@01000000
```

**注意**:每个USB控制器都有一个唯一的IOPathMatch值，如果你有多个同名控制器，请记住这一点。这款Asus X299板有2个PXSX USB控制器，因此每个新的USB map字典将有一个唯一的IOPathMatch条目。

#### IOProviderClass

查找IOProviderClass也很简单，再次选择Root-hub并查找CFBundleIdentifier值:

| IOReg | info.plist |
| :--- | :--- |
| ![](../../images/post-install/manual-md/ioproviderclass.png) | ![](../../images/post-install/manual-md/iorpoviderclass-plist.png) |

现在我们不能把这个值设为1-1，而是需要将Kext的短名称改为`AppleUSBXHCIPCI`(因此我们删除了`com.apple.driver.usb.`)。

#### model

如果你忘记了你正在使用的SMBIOS，你可以在IOReg中检查顶级设备:

| IOReg | info.plist |
| :--- | :--- |
| ![](../../images/post-install/manual-md/smbios.png) | ![](../../images/post-install/manual-md/smbios-plist.png) |

### IOProviderMergeProperties

现在让我们打开IOProviderMergeProperties字典:

![](../../images/post-install/manual-md/ioprovidermerge.png)

这里我们有很多数据要处理:

| 属性 | 说明 |
| :--- | :--- |
| name | USB端口的字典名称 |
| port-count | 这是要注入的最大端口值 |
| UsbConnector | 这是ACPI 9.14节中提到的USB端口类型 |
| port | 您的USB端口在ACPI中的物理位置 |
| Comment | 一个可选的条目，帮助您备注端口 |

And a reminder of all possible port types:

| Type | Info | Comments |
| :--- | :--- | :--- |
| 0 | USB 2.0 Type-A连接器 | 这是macOS在没有映射时默认的所有端口 |
| 3 | USB 3.0 Type-A连接器 | 3.0、3.1和3.2端口共享相同的类型 |
| 8 | Type C连接器 - 仅支持USB 2.0 | 主要出现在手机上
| 9 | Type C连接器 - USB 2.0和USB 3.0带开关 | 翻转设备**不会**改变ACPI端口 |
| 10 | Type C连接器 - USB 2.0和USB 3.0不带开关 | 翻转设备**会**改变ACPI端口。通常可以在3.1/2主板标头上看到 |
| 255 | 专用连接器 | 用于内部USB端口，如蓝牙 |

现在应该回到原点了，你可以看到我们之前映射端口的工作方式。

#### name

name属性实际上是USB端口字典的名称，仅用于内部维护。记住，你想使用的每个USB端口都需要有自己独特的USB端口字典。

除了显示在IOReg中，名称本身没有任何值，所以这可以是你喜欢的任何值。为了保持正常，我们使用ACPI表已经给出的名称(在本例中是HS01)，但名称可以是任何4个字符的条目。但是不要超过这4字符限制,会发生意想不到的副作用。

* 注意:那些带有AppleUSB20XHCIPort或AppleUSB30XHCIPort名称的USB端口，你应该选择一个易于识别的名称。在英特尔，这是HSxx为2.0特型，SSxx为3.0特型

![](../../images/post-install/manual-md/name.png)

#### port

要找到`port`值，只需在IOReg中选择你的USB端口并查找`port`条目:

| IOReg | info.plist |
| :--- | :--- |
| ![](../../images/post-install/manual-md/port.png) | ![](../../images/post-install/manual-md/port-plist.png) |

从这里我们得到`<03 00 00 00>`，你可以简单地删除任何空格并将其添加到你的USB映射中

#### 端口数

最后剩下的值，回头看看你的USB映射表，看看哪个`port`条目最大:

![](../../images/post-install/manual-md/port-count.png)

这里我们看到PXSX(1)中最大的是`<04000000>`，请记住，如果您在USB map中获得任何字母，`port`使用十六进制。

### 继续

现在我们已经讨论了如何为特定的控制器映射USB端口，您应该有足够的理解来映射更多的控制器。我提供的示例USB-map.kext有3个USB控制器列在其中(PXSX-1, PXSX-2和XHCI)。记得相应地编辑并删除任何不必要的映射。

## 清理

一旦你保存了你的USB地图的 info.plist, 记得添加kext到你的 EFI/OC/Kexts 并添加到config.plist的 Kernel -> Add(ProperTree的快照可以为你做这件事)

接下来，删除/禁用:

* USBInjectAll.kext(如果你正在使用它)
  * 原因是USBInjectAll实际上破坏了Apple构建端口映射的方式。因此，虽然它对于初始端口映射很好，但它可能会破坏你最终的USB映射
* Kernel -> Quirks -> XhciPortLimit -> False
  * 现在我们终于低于15个端口的限制，我们不再需要这个黑客式的修复

然后重新启动，最后一次检查IOReg:

![](../../images/post-install/manual-md/finished.png)

瞧!如你所见，我们的USB地图应用成功!

需要验证的主要属性是:

* 正确设置Usb接口的Usb连接器属性
* 应用注释(如果注入)
* 移除未使用的端口
