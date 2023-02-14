# 使用启动器选项

* 注意:在OpenCore 0.6.6中，Bootstrap.efi已被LauncherOption取代。查看这里关于更新的更多信息:[在0.6.6更新引导](#updating-bootstrap-in-0-6-6)

使用OpenCore 0.6.6及更新版本，我们现在可以直接从我们的固件启动OpenCore，而不需要启动器(Bootstrap efi或BOOTx64.efi)作为中介。这允许我们将OpenCore添加到主板的启动菜单中，并防止Windows或Linux试图覆盖`EFI/boot/BOOTx64.EFI`路径的问题，这可能在安装或更新Windows时发生，从而破坏OpenCore的启动能力。

## 前提条件

![](../images/bootstrap-md/config.png)

* [OpenCore 0.6.6 or newer](https://github.com/acidanthera/OpenCorePkg/releases)
  * 对于0.6.5和更老的用户升级，请参见这里:[在0.6.6中更新引导](#updating-bootstrap-in-0-6-6)
* config.plist settings:
  * `Misc -> Boot -> LauncherOption` = `Full`
    * 使用 `Short` 使用
  * `UEFI -> Quirks -> RequestBootVarRouting` = `True`
* [OpenShell](https://github.com/acidanthera/OpenCorePkg/releases)
  * 与OpenCore绑定
  * 记得将此添加到EFI/OC/Tools和`Misc -> Tools`
  * 这主要用于故障排除

## 引导

如果一切都正确设置，第一个启动将让OpenCore在我们的BIOS中创建一个新的启动选项(指向`EFI/OC/OpenCore.EFI`)，未来的启动将更新条目，以确保它是正确的，并确保它仍然存在。这现在允许我们删除BOOTx64 efi，而不必担心其他操作系统会覆盖`efi/BOOT/BOOTx64.efi`路径。

## 故障排除

如果没有创建新的引导选项，可以按照这些故障排除步骤进行，但首先要仔细检查是否满足了前提条件。以下部分是一个迷你指南，以防启动器选项不起作用或你想手动执行。

* [验证启动程序选项条目是否适用](#verify-launcheroption-entry-was-applied)
* [从BIOS中删除启动器选项条目](#removing-launcheroption-entry-from-bios)

### 验证LauncherOption条目是否适用

对于那些想要验证在OpenCore中应用的条目，启用日志记录(参见[OpenCore调试](https://sumingyd.github.io/OpenCore-Install-Guide/troubleshooting/debug.html))并检查类似于这些条目:

```
OCB: Have existing option 1, valid 1
OCB: Boot order has first option as the default option
```

### 从BIOS中删除启动器LauncherOption

因为启动器选项项在重置NVRAM时是受保护的项，所以你需要先禁用`LauncherOption`，然后才能删除它:

* `Misc -> Security -> AllowNvramReset -> True`
* `Misc -> Boot -> LauncherOption -> Disabled`

一旦这些设置完毕，您可以重新启动进入OpenCore 选择器，并选择`Reset NVRAM`条目以清除您的NVRAM，这将删除启动器选项条目。

## 在0.6.6中更新Bootstrap

对于那些更新到0.6.6的人，您可能已经注意到`Bootstrap.efi`已从OpenCore中删除。这是由于OpenCore工作方式的改变;具体来说，OpenCore现在是一个UEFI应用程序而不是驱动程序。这意味着`OpenCore.efi`可以直接加载，不再需要启动器(Bootstrap.efi)。

### 禁用Bootstrap

如果Bootstrap在升级到0.6.6之前就被禁用了，那么你不需要做任何更改，只需要进行通常的文件交换即可。如果之后你想尝试`LauncherOption`，你可以这样做没有问题。

### 启用Bootstrap

如果Bootstrap是在升级到0.6.6之前启用的，并且你的主板固件会自动检测`EFI/BOOT/BOOTx64.EFI`，你可以在更新之前执行以下操作:

1. 设置`Misc -> Security -> AllowNvramReset`为`True`， `Misc -> Security -> BootProtect`为`None`，然后重置NVRAM(在OpenCore外部或内部)并启动。这将删除旧的Bootstrap启动项。
2. 更新您的OpenCore设置正常，确保您从OpenCore包复制BOOTx64.efi到`efi/BOOT/BOOTx64.efi`，并在config.plist中将`Misc -> BOOT -> LauncherOption`设置为`Full`(或`Short`，如果以前使用`BootstrapShort`)。
3. 重新启动

   在第一次启动时，您需要从`EFI/boot/BOOTx64.EFI`启动，但在后续启动时，您应该看到由OpenCore直接启动`OpenCore.EFI`创建的LauncherOption条目。

如果您的固件不能自动检测`EFI/BOOT/BOOTx64.EFI`，或者您由于任何原因无法将OpenCore的启动器放在那里，您有多种其他选项:

* 将`OpenShell.efi`放在USB上，重命名并移动到`efi/BOOT/BOOTx64.efi`，然后按照上面的步骤操作，只是不要从启动菜单中选择`BOOTx64.efi`，而是引导到USB并从那里直接启动OpenCore。
* 添加一个文件夹`EFI/OC/Bootstrap`，并从OpenCore包中复制并重命名BOOTx64.EFI到`EFI/OC/Bootstrap/Bootstrap.EFI`。然后，在更新您的OpenCore设置后，将`Misc -> Boot -> LauncherOption`设置为适当的选项(`Full`，或`Short`，如果以前使用`BootstrapShort`)并使用由Bootstrap创建的现有条目引导OpenCore。第一次启动后，您应该看到添加了一个新的OpenCore启动条目。然后你可以在OpenCore中重置NVRAM(确保启用`LauncherOption`，这样你就不会删除新的条目)以删除旧的Bootstrap引导条目。

转换说明:

| 0.5.8 - 0.6.5 | 0.6.6+ |
| :--- | :--- |
| Misc -> Security -> BootProtect | Misc -> Boot -> LauncherOption |
| Bootstrap | Full |
| BootstrapShort | Short |
