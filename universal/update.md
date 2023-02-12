# 更新OpenCore和macOS

## 更新OpenCore

所以更新OpenCore的主要注意事项:

* [Releases](https://github.com/acidanthera/OpenCorePkg/releases) 在每个月的第一个星期一发布
* [Differences.pdf](https://github.com/acidanthera/OpenCorePkg/blob/master/Docs/Differences/Differences.pdf) 会告诉你与之前的版本相比，这个OpenCore版本中添加和删除的所有内容
* OpenCore安装指南将在[标题](https://sumingyd.github.io/OpenCore-Install-Guide/) 中有关于它支持的发布版本的说明

> 那我怎么更新呢?

具体过程如下:

### 1. **下载最新版OpenCore**

* [OpenCorePkg](https://github.com/acidanthera/OpenCorePkg/releases)

### 2. **挂载你的EFI**

* 因此，首先，让我们挂载硬盘的EFI，并在某个安全的地方用[MountEFI](https://github.com/corpnewt/MountEFI)做一个拷贝。我们不会一开始就更新硬盘的EFI，相反，我们会拿一个备用USB作为我们的虚拟机。这允许我们保留一个OpenCore的工作副本，以防我们的更新失败

* 对于USB，必须格式化为GUID。原因是GUID会自动创建一个EFI分区，尽管默认情况下这是隐藏的，所以你需要用MountEFI挂载它。

 ![](../images/post-install/update-md/usb-erase.png)

* 现在您可以将您的OpenCore EFI放在USB上

 ![](../images/post-install/update-md/usb-folder.png)

### 3. **用刚才下载的文件替换OpenCore文件**

* 需要更新的重要内容:

  * `EFI/BOOT/BOOTx64.efi`
  * `EFI/OC/OpenCore.efi`
  * `EFI/OC/Drivers/OpenRuntime.efi`(**不要忘记这个，OpenCore不会启动不匹配的版本**)

* 如果有的话，你也可以更新其他驱动程序，这些只是为了正确引导**必须**更新的驱动程序

![](../images/post-install/update-md/usb-folder-highlight.png)

### 4. **比较你的 config.plist 和新的 Sample.plist**

* 有几种方法可以做到这一点:

  * [OCConfigCompare](https://github.com/corpnewt/OCConfigCompare) 用于比较sample.plist 和你的 config.plist
  * 在终端中输入`diff (file input 1) (file input 2)`
  * [Meld Merge](https://github.com/yousseb/meld/releases/), [WinMerge](https://winmerge.org/)，或其他您最喜欢的比较软件
  * 根据阅读更新的OpenCore安装指南制作一个新配置

![](../images/post-install/update-md/oc-config-compare.png)

* 一旦您进行了调整，以确保您的配置与OpenCore的最新版本兼容，您可以使用OpenCore实用工具ocvalidate:此工具将帮助确保您的 config.plist 与匹配构建的OpenCore规范匹配。
  * 请注意，`ocvalidate`必须与使用的OpenCore版本匹配，并且可能无法检测到文件中存在的所有配置缺陷。我们建议您使用OpenCore指南再次检查您的设置，以了解设置的内容，否则请阅读[Differences.pdf](https://github.com/acidanthera/OpenCorePkg/blob/master/Docs/Differences/Differences.pdf) 以获取有关更改的更深入的文档。
  * 要运行`ocvalidate`， `cd`进入OpenCore的`utilities/ocvalidate/`再运行`./ocvalidate`。注意，你可能需要运行`chmod +x ocvalidate`才能执行。
  * 此外，更新ProperTree并执行OC快照(Ctrl/Cmd+R)，以确保您的SSDTs、驱动程序、kext等的配置条目符合OpenCore预期的格式。

![](../images/post-install/update-md/ocvalidate.png)

### 5. **引导!**

* 一旦虚拟USB正常工作，你就可以挂载EFI并将其移动到硬盘的EFI分区。记得保留一份你的旧EFI的副本，以防万一OpenCore在路上表现得很滑稽

## 更新kext

* 更新kext与更新OpenCore的过程类似，复制所有内容并在虚拟USB上更新，以防出现问题

* 更新kext最简单的方法是使用以下两个工具:

  * [Lilu 和 Friends](https://github.com/corpnewt/Lilu-and-Friends) 下载并编译kext
  * [Kext Extractor](https://github.com/corpnewt/KextExtractor) 合并到您的EFI

## 更新macOS

* 所以这可能是最具挑战性的部分之一，通过操作系统更新来维护您的系统。需要注意的主要事项:
  * 更新操作系统时，请确保所有内容都已更新，并且有某种形式的恢复，如TimeMachine或已知EFI良好的旧macOS安装程序
  * 在谷歌上搜索一下，看看其他人对最新的更新是否有问题

* 我还提供了更多关于macOS版本中变化的详细示意图，参见下面:

**macOS Catalina**:

* 10.15.0
  * [需要适当的EC](https://sumingyd.github.io/Getting-Started-With-ACPI/)
  * 双插座和大多数AMD cpu需要 [AppleMCEReporterDisabler.kext](https://github.com/acidanthera/bugtracker/files/3703498/AppleMCEReporterDisabler.kext.zip)
  * MacPro5,1的支持已经取消
* 10.15.1
  * 需要WhateverGreen 1.3.4+
  * 破坏了许多gpu的DRM(参见[DRM图表](https://github.com/acidanthera/WhateverGreen/blob/master/Manual/FAQ.Chart.md))
  * 需要所有以前的修复
* 10.15.2
  * 修复了安装程序中的Navi支持
  * 需要所有以前的修复
* 10.15.3
  * 不变
  * 需要所有以前的修复
* 10.15.4
  * [AMD CPU用户需要更新`cpuid_set_cpufamily`补丁](https://github.com/AMD-OSX/AMD_Vanilla)
  * 修正了许多基于Ellesmere的北极星gpu上的DRM
  * 需要之前所有的修复(不包括Polaris DRM的`shikigva=80`)
* 10.15.5
  * UHD 630的framebuffer坏了，如果你收到黑屏，你可能需要从`07009B3E`切换到`00009B3E`
  * Comet Lake不再需要欺骗CPU ID
* 10.15.6
  * 不变
  * 需要10.15.5之前的所有修复
* 10.15.7
  * 不变
  * 需要10.15.5之前的所有修复
  
**macOS Big Sur**:

* 11.0.1
  * 查看这里: [OpenCore 和 macOS 11: Big Sur](https://sumingyd.github.io/OpenCore-Install-Guide/extras/big-sur/)

**macOS Monterey**:

* 12.0.1
  * 查看这里: [OpenCore 和 macOS 12: Monterey](https://sumingyd.github.io/OpenCore-Install-Guide/extras/monterey.html)
