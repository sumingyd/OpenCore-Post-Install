# 修复分辨率和详细信息

想要使用macOS获得更简洁的启动体验，而不是启动时冗长的文本?你需要几件事:

## macOS整理

**`Misc -> Debug`**

* 将`AppleDebug`设置为False，这将在启动时移除boot.efi调试。

**`NVRAM -> Add -> 7C436110-AB2A-4BBB-A880-FE41995C9F82`**:

* 在config.plist中删除引导参数中的`-v`

**`NVRAM -> Add -> 4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14`**:

* UIScale
  * `01`: 标准分辨率
  * `02`: HiDPI (保险库通常需要在较小的显示器上正常工作)

**`UEFI -> Output`**:

* `TextRenderer` 设置为`BuiltinGraphics`
* `Resolution`: 设置为 `Max` 以获得最佳效果
  * 可选指定分辨率:`WxH@Bpp(例如1920x1080@32)`或`WxH(例如1920x1080)`
* `ProvideConsoleGop` 设置为 True

如果仍然有问题，请参阅[Configuration.pdf](https://github.com/acidanthera/OpenCorePkg/blob/master/Docs/Configuration.pdf)以获得所有可能的选项。

## OpenCore整理

如果您在安装过程中密切遵循本指南，您可能会运行调试版本的OpenCore，并且在每次启动时将创建一个.txt文件。对于那些想要删除OpenCore的额外调试消息和.txt文件生成的人，请参见以下内容:

**在config.plist中**:

* `Misc -> Debug -> Target`: 3
  * `Target`决定记录什么以及如何记录，请参阅[OpenCore 调试](https://sumingyd.github.io/OpenCore-Install-Guide/troubleshooting/debug.html)了解更多值
  
**在EFI中**:

* 将以下文件替换为[发布版本](https://github.com/acidanthera/OpenCorePkg/releases)(如果以前使用的是调试版本):
  * EFI/BOOT/
    * `BOOTx64.efi`
  * EFI/OC/Drivers/
    * `OpenRuntime.efi`
  * EFI/OC/
    * `OpenCore.efi`
