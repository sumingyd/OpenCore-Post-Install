# FileVault

FileVault是macOS内置的驱动加密，与传统的Clover驱动程序相比，OpenCore对它的支持得到了极大的改进。

首先，你需要以下 .efi 驱动程序:

* OpenRuntime.efi
  * [OpenUsbKbDxe.efi](https://github.com/acidanthera/OpenCorePkg/releases) 针对DuetPkg用户(未支持UEFI的系统)

**不要在OpenCore中使用VirtualSMC.efi，它已经内置了**。不过，您仍然需要VirtualSMC.kext

设置你的 config.plist:

* Misc -> Boot
  * `PollAppleHotKeys` 设置为 YES(虽然不需要，但可能会有所帮助)
* Misc -> Security
  * `AuthRestart` 设置为 YES(启用FileVault 2的身份验证重启，因此重启时不需要密码。可以被认为是一种安全风险，所以可选)
* NVRAM -> Add -> 4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14
  * `UIScale` 设置为 `02` 用于高分辨率的小型显示器
* UEFI -> Input
  * `KeySupport` 设置为 YES(使用OpenCore内置输入时，使用OpenUsbKbDxe的用户应避免使用)
* UEFI -> Output
  * `ProvideConsoleGop` to YES
* UEFI -> ProtocolOverrides
  * `FirmwareVolume` 设置为 YES
  * `HashServices` 设置为 YES 对于Broadwell和更老的(包括X99)，这对于SHA-1散列崩溃的系统是必需的
* UEFI -> Quirks
  * `RequestBootVarRouting` 设置为 YES
  * `ExitBootServicesDelay` 设置为 `3000`-`5000` 如果您在Aptio IV固件(Broadwell或更老版本)上收到 `Still waiting for root device`

有了这些，你可以像在普通mac上一样在“系统首选项->安全和隐私-> FileVault”下启用FileVault。

关于UI问题，参见[修复分辨率和详细信息](../../cosmetic/verbose.md)
