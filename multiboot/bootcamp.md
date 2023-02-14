# 安装和使用BootCamp工具

OpenCore的一个简洁特性是能够完全避免BIOS，只使用启动盘进行多引导。当我们试图引导windows，但没有办法将引导选项设置回macOS时，问题就出现了。这就是BootCamp工具的用武之地。

* 注意:本指南将不介绍Windows安装程序的创建，只介绍BootCamp驱动程序的安装。
  * 创建Windows安装程序的例子:[构建一个可引导的Windows ISO](https://www.freecodecamp.org/news/how-make-a-windows-10-usb-using-your-mac-build-a-bootable-iso-from-your-macs-terminal/)
  * 提醒:Windows **必须**基于GPT/GUID, OpenCore将不会引导legacy安装
* 注意2:从macOS使用BootCamp工具将擦除EFI/BOOT/BOOTx64.EFI文件，这是启动OpenCore所需的。而且OpenCore本身不支持基于MBR的安装，因此该实用程序对我们毫无用处

## 准备工作

首先，我们需要以下内容:

* 已经安装Windows
  * 必须基于UEFI / GPT
* [Brigadier](https://github.com/corpnewt/brigadier)
  * 下载BootCamp驱动程序
* 设置[LauncherOption] (../multiboot/bootstrap.md)
  * 不是必需的，但可以帮助缓解OpenCore使用的BOOTx64.efi擦除Windows时的头痛

## 安装

安装非常简单，只需获取[Brigadier](https://github.com/corpnewt/brigadier)并运行`Brigadier`。Windows使用`.bat`， macOS使用`Brigadier.command`。如果你当前使用的SMBIOS有BootCamp问题，或者想下载另一个SMBIOS，你可以在末尾添加`——model{SMBIOS}`:

```sh
path/to/Brigadier --model MacPro7,1
```

* **注意**:旧版本的BootCamp安装程序(6.0)不支持APFS，你需要选择一个更新的SMBIOS将它捆绑(即。iMac 19,1)或在安装后更新你的bootcamp软件。有关故障排除的更多细节请参见下面的内容:[Windows启动磁盘无法看到APFS驱动器](#windows-startup-disk-cant-see-apfs-drives)

![](../images/bootcamp-md/extension.png)

接下来你会在下面找到我们的bootcamp驱动程序:

* Windows:

```sh
\Users\{Username}\bootcamp-{filename}\BootCamp
```

* macOS:

```sh
/Users/{Username}/BootCamp-{filename}/WindowsSupport.dmg
```

macOS用户接下来需要扩展WindowsSupport.dmg，并把它放在Windows可以得到的地方。

![](../images/bootcamp-md/done.png)

接下来，在Windows中，您有两个选择。

要么导航到`bootcamp-{filename}\ bootcamp`文件夹，然后运行`Setup. txt`文件。这需要正确的SMBIOS SystemProductName欺骗-显示为系统模型在Windows -以启动:

![](../images/bootcamp-md/location.png)

或者，以管理员身份启动`bootcamp-{filename}\bootcamp\Drivers\Apple\bootcamp.msi`——例如，通过直接从管理员命令shell启动它——这将完全跳过bootcamp模型检查:

![](../images/bootcamp-md/location_msi.png)

一旦所有完成，你现在有BootCamp切换!在你的托盘中应该有一个小的BootCamp图标，现在你可以选择启动到哪个驱动器。

* 注意:对于那些不需要BootCamp提供的额外驱动程序，你可以删除以下内容:
  * `$WinPEDriver$`: **不要**删除文件夹本身，只删除里面的驱动程序
    * 苹果Wifi卡用户需要保留以下内容:
      * `$WinPEDriver$/BroadcomWireless`
      * `$WinPEDriver$/BroadcomBluetooth`
      * `$WinPEDriver$/AppleBluetoothBroadcom`
  * `BootCamp/Drivers/...`
    * **不要** 删除 `BootCamp/Drivers/Apple`
    * 苹果Wifi卡用户需要保留以下内容:
      * `BootCamp/Drivers/Broadcom/BroadcomBluetooth`

## 故障排除

* [在选择器中找不到Windows/BootCamp驱动器](#cant-find-windowsbootcamp-drive-in-picker)
* ["您不能将启动磁盘更改为所选磁盘"错误](#you-cant-change-the-startup-disk-to-the-selected-disk-error)
* [启动Windows会导致蓝屏或Linux崩溃](#booting-windows-results-in-bluescreen-or-Linux-crashes)
* [引导Windows错误:`OCB: StartImage failed - Already started`](#booting-windows-error-ocb-startimage-failed---already-started)
* [Windows启动盘看不到APFS驱动器](#windows-startup-disk-cant-see-apfs-drives)

## 在选择器中找不到Windows/BootCamp驱动器

因此，使用OpenCore，我们必须注意，传统的Windows安装不支持，只有UEFI。现在大多数安装是基于UEFI的，但是那些由BootCamp Assistant在macOS中制作的是基于legacy的，所以你必须找到其他方法来制作安装程序(谷歌是你的朋友)。这也意味着MasterBootRecord/Hybrid分区也被破坏了，所以你需要格式化你想安装到DiskUtility的驱动器。

现在开始进行故障排除:

* 确保 `Misc -> Security -> ScanPolicy` 设置为 `0` 以显示所有驱动器

如果Windows和OpenCore的引导加载程序在同一个驱动器上，你需要添加一个BlessOverride条目:

```
Misc -> BlessOverride -> \EFI\Microsoft\Boot\bootmgfw.efi
```

* **注**:从OpenCore 0.5.9开始，这个不再需要指定。OpenCore应该会自动发现这个条目

![](../images/win-md/blessoverride.png)

## "您不能将启动磁盘更改为所选磁盘"错误

这通常是由以下原因引起的:

* 第三方NTFS驱动程序(即。Paragon)
* Windows驱动器的不规则分区设置，特别是EFI不是第一个分区。

要修复前者，要么禁用或卸载这些工具。

要解决后者，我们需要启用这个选项:

* `PlatformInfo -> Generic -> AdviseFeatures -> True`

![](../images/bootcamp-md/error.png)

## 启动Windows会导致蓝屏或Linux崩溃

这是由于对齐问题，请确保在支持MATs的固件上启用了`SyncRuntimePermissions`。检查你的日志，你的固件是否支持内存属性表(通常在2018年或更新的固件上看到)

对于Z390和更新的主板，您还需要启用`ProtectUefiServices`以确保正确应用OpenCore的补丁。

如果你的固件很旧(通常是2013年或更老)，你需要启用`ProtectMemoryRegions`。

由于不同厂商的固件版本不尽相同，你需要尝试一下这3种特性的组合，看看哪一种效果最好。

常见的Windows错误代码:

* `0xc000000d`

## 引导Windows错误:`OCB: StartImage failed - Already started`

这是由于OpenCore在尝试引导Windows时感到困惑，并意外地认为它正在引导OpenCore。这可以通过移动Windows到它自己的驱动器*或*在BlessOverride下添加一个自定义驱动器路径来避免。参见[Configuration.pdf](https://github.com/acidanthera/OpenCorePkg/blob/master/Docs/Configuration.pdf)和[在选择器中找不到Windows/BootCamp驱动器](#cant-find-windowsbootcamp-drive-in-picker)条目了解更多详细信息。

## Windows启动盘看不到APFS驱动器

* 过时的BootCamp驱动程序(通常6.0版本会附带brigadier, macOS中的BootCamp实用程序提供了较新的版本，如ver 6.1)。你可以尝试用苹果的软件更新程序更新到最新版本，或者从brigadier(也就是苹果电脑)选择更新的SMBIOS来缓解这些问题。（如’——iMac19,1’)和跑brigadier的时候。

对于后者，你需要运行以下命令(将`文件名.msi`替换为BootCamp安装的msi):

```sh
msiexec.exe /x "c:\filename.msi"
```
