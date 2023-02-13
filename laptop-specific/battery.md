# 电池状态

有了[ECEnabler.kext](https://github.com/1Revenger1/ECEnabler/releases/latest)，工作电池百分比不再需要ACPI补丁。如果您希望电池功能超过充电百分比(例如，循环计数，或温度/其他补充数据)或有双电池，您仍然需要创建ACPI补丁-请参阅下面的资源。

* *如果电池状态即使使用ECEnabler也不能工作，请确保在OpenCore配置中启用了[SMCBatteryManager](https://github.com/Acidanthera/VirtualSMC/releases/latest) VirtualSMC插件。

* 某些设备，如Surface 3、Surface Pro 5、Surface Book 2和Surface Laptop(以及所有后续的Surface设备)，使用专有的嵌入式控制器(或其他类似硬件)而不是标准的ACPI电池设备和OperationRegion字段，因此如果没有设备特定的kext，电池状态无法工作。

::: details 电池补丁资源

* 注意:如果您正在使用ECEnabler kext，则不需要按照下面的指南分割EC字段。这意味着您可以直接在DSDT中使用字段名称，而不是通过实用程序方法(例如 `B1B2`, `B1B4`, `RE1B`, 和 `RECB`).

## 双电池

因为macOS不支持双电池系统，你必须在ACPI中合并两个电池。

有关如何处理双电池笔记本电脑的信息，请参阅VirtualSMC文档:[链接](https://github.com/acidanthera/VirtualSMC/blob/master/Docs/Dual%20Battery%20Support.md)

## 周期计数

一些笔记本电脑供应商，如惠普，已经提供了供应周期计数信息。然而，他们的固件要么没有实现它，要么在`_BIX`方法中暴露它。在过去，Rehabman的ACPIBatteryManager采用了一种hack来支持不具有`_BIX`方法的固件的周期计数，然而在SMCBatteryManager中，这已不再支持。

有关如何从ACPIBatteryManager周期计数hack过渡到正确的`_BIX`方法实现的信息，请参阅VirtualSMC文档:[链接](https://github.com/acidanthera/VirtualSMC/blob/master/Docs/Transition%20from%20zprood%27s%20cycle%20count%20hack.md)

对于那些第一次实现周期计数而不是从ACPIBatteryManager周期计数hack过渡的人来说，文档可能也证明是有用的。

## 电池信息补充

虽然许多笔记本电脑在它们的EC领域提供补充的电池信息(例如制造日期和电池温度)，但传统的`_BIF`、`_BIX`和`_BST` ACPI方法不支持提供这些信息。因此，SMCBatteryManager支持两个ACPI方法，`CBIS`和`CBSS`来为macOS提供这些信息。

有关如何实现这些方法的信息，请参阅VirtualSMC文档:[链接](https://github.com/acidanthera/VirtualSMC/blob/master/Docs/Battery%20Information%20Supplement.md)

:::

::: details Legacy补丁资源

* 注意:Rehabman的指南说要使用ACPIBatteryManager，你必须使用SMCBatteryManager。

## DSDT补丁

虽然自定义DSDT注入应该避免，以防止Windows和固件更新的问题，它可以作为一个相当有帮助的起点，因为它更容易掌握和自己做:

**[Rehabman如何为工作的电池状态修补DSDT](https://www.tonymacx86.com/threads/guide-how-to-patch-dsdt-for-working-battery-status.116102/)**

* 注意:当重新注入您的DSDT时，它应该是在config.plist中添加的ACPI ->列表中的第一个。请记住，补丁DSDT也会进入EFI/OC/ACPI

* 注2:避免使用由Rehabman提供的MaciASL和iASL，它们长期被忽视，因此强烈建议从Acidanthera获取更新的变体:[MaciASL](https://github.com/acidanthera/MaciASL/releases)

## 电池热补丁

一旦你终于让你的DSDT打上补丁并在macOS中工作，是时候创建我们自己的热补丁了。与普通的DSDT补丁不同的是，它是在DSDT中动态完成的，允许固件更新具有更大的灵活性:

**[Rehabman's Guide to Using Clover to "hotpatch" ACPI](https://www.tonymacx86.com/threads/guide-using-clover-to-hotpatch-acpi.200137/)**

* 注意:具体来说，post#2提到了电池热补丁

:::
