# 将OpenCore从USB移动到macOS驱动器

## 从USB中抓取OpenCore

首先，我们要从安装程序中抓取OpenCore。为此，我们将使用CorpNewt提供的一个名为[MountEFI](https://github.com/corpnewt/MountEFI)的工具。

在这个例子中，我们假设你的USB名为`Install macOS Catalina`:

![](../images/post-install/oc2hdd-md/usb-mount.png)

一旦EFI挂载完毕，我们就需要把EFI文件夹放在那里并保存在一个安全的地方。然后我们要**弹出USB驱动器的EFI**，因为挂载多个EFI有时会混淆macOS，最佳实践是一次只挂载一个EFI(你可以只弹出EFI，不需要删除驱动器本身)。

**注**:在Windows上使用gibMacOS的MakeInstall bat制作的安装程序将默认到主引导记录(MBR)分区映射，这意味着没有专用的EFI分区，而是在macOS中默认挂载的`Boot`分区。

![](../images/post-install/oc2hdd-md/hdd-mount.png)

现在完成这些，让我们挂载macOS驱动器。使用macOS Catalina, macOS实际上被划分为2个卷:系统分区和用户分区。这意味着MountEFI可以在它的选择器中报告多个驱动器，但每个分区仍然共享相同的EFI(UEFI规范只允许每个驱动器一个EFI)。你可以判断它和磁盘**X**sY是否是同一个驱动器(Y表示它是哪个分区)

![](../images/post-install/oc2hdd-md/hdd-clean.png)

当你挂载主驱动器的EFI时，你可能会看到一个名为`APPLE`的文件夹，这是用于在真正的mac上更新固件，但对我们的硬件没有影响。你可以擦除EFI分区上的所有东西，用USB上找到的那个替换它

## 给老用户的特别提示

当传输EFI时，仍然有引导扇区需要写入，以便您的非uefi BIOS能够找到它。所以不要忘记在你的macOS上重新运行 [`BootInstallARCH.tool`](https://sumingyd.github.io/OpenCore-Install-Guide/installer-guide/mac-install.html#legacy-setup)
