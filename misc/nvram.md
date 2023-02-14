# 模拟NVRAM

::: danger 危险

这不是OpenCore 0.8.3的最新版本!

:::

所以本节是为那些没有原生NVRAM的人准备的，与macOS不兼容的原生NVRAM的最常见硬件是X99和一些X299系列芯片组。

* X99
* X299

对于B360、B365、H310、H370和Z390用户，确保你在EFI/OC/ACPI和config.plist -> ACPI -> Add下都有[SSDT-PMC](https://sumingyd.github.io/Getting-Started-With-ACPI/)。关于制作和编译SSDT的更多信息，请看 [**开始使用ACPI**](https://sumingyd.github.io/Getting-Started-With-ACPI/)

## 清理Clover的垃圾

有些人可能没有注意到，但Clover可能已经在macOS中安装了RC脚本，以进行适当的NVRAM模拟。这是一个问题，因为它与OpenCore的模拟方法相冲突。

要删除的文件。

* `/Volumes/EFI/EFI/CLOVER/drivers64UEFI/EmuVariableUefi-64.efi`
* `/Volumes/EFI/nvram.plist`
* `/etc/rc.clover.lib'
* `/etc/rc.boot.d/10.save_and_rotate_boot_log.local`
* `/etc/rc.boot.d/20.mount_ESP.local`
* `/etc/rc.boot.d/70.disable_sleep_proxy_client.local.disabled`
* `/etc/rc.shutdown.d/80.save_nvram_plist.local`

如果文件夹是空的，也要删除它们。

* `/etc/rc.boot.d`
* `/etc/rc.shutdown.d`

## 验证你是否有工作的NVRAM

首先，打开终端，运行以下命令，在NVRAM中设置一个名为`test`的变量为当前日期和时间。

```sh
sudo nvram myvar="$(date)"
```

现在重新启动并运行这个命令。

```sh
nvram myvar
```

如果没有返回，那么你的NVRAM就没有工作。如果有一行包含`myvar`，然后是当前日期，那么你的NVRAM就工作了。

## 模拟NVRAM(使用`nvram.plist`)

如果你没有本地的NVRAM，不要着急。我们可以通过使用脚本来设置模拟NVRAM，在关机过程中将NVRAM内容保存到plist中，然后在下次启动时由OpenCore加载。

要启用模拟NVRAM，你需要进行以下设置。

在你的config.plist中：

* **Booter -> Quirks**。
  * `DisableVariableWrite`：设置为`NO`
* **Misc -> Security**:
  * `ExposeSensitiveData`: 设置为至少`0x1`
* **NVRAM**:
  * `LegacyOverwrite`设置为`YES`
  * `LegacySchema`: 设置NVRAM变量（OpenCore将这些变量与`nvram.plist`中的变量进行比较）
  * `WriteFlash`：设置为`YES`

而在你的EFI中：

* `OpenVariableRuntimeDxe.efi`驱动程序
* `OpenRuntime.efi` 驱动程序 (这对于正确的睡眠、关机和其他服务的正常工作是必需的)

确保在快照之后，确保这些驱动被列在你的config.plist中。之后，确保`OpenVariableRuntimeDxe.efi`和`OpenRuntime.efi`的`LoadEarly`设置为`YES`，并且`OpenVariableRuntimeDxe.efi`在你的配置中被置于`OpenRuntime.efi`之前。

现在抓取[LogoutHook文件夹](https://github.com/acidanthera/OpenCorePkg/releases)(在`Utilities`内)并把它放在安全的地方(例如在你的用户目录内，如下所示)

`/Users/$(whoami)/LogoutHook/`

打开终端，运行以下程序（一次一个）。

```bash
cd /Users/$(whoami)/LogoutHook/
./Launchd.command install 
```

然后就可以了! 你有了模拟的NVRAM!
