# 修复关机/重启

因此，在使用macOS时，你可能会遇到一个奇怪的现象:当你关机时，你的PC可能会重新启动。这实际上是由于缺少S5调用导致控制器断电。当然，Windows和Linux实现了一些hack来解决这个问题，但macOS没有这样的修复，相反，我们需要做一些脏活，修复他们的ACPI编写。别担心，这不会影响其他操作系统。

为此，我们需要以下内容:

* [FixShutdown-USB-SSDT.dsl](https://github.com/dortania/OpenCore-Post-Install/blob/master/extra-files/FixShutdown-USB-SSDT.dsl)
* [_PTS to ZPTS Patch](https://github.com/dortania/OpenCore-Post-Install/blob/master/extra-files/FixShutdown-Patch.plist)
* USB控制器的ACPI路径

要找到需要修复的USB控制器，请在您的DSDT中搜索`_PRW`，并查看其中提到的设备，通常情况下，这将类似于`SB.PCI0.XHC`。

使用ACPI路径，编辑FixShutdown-USB-SSDT.dsl并将其编译为.aml文件(已组装)。[MaciASL可以帮助你做到这一点](https://sumingyd.github.io/Getting-Started-With-ACPI/Manual/compile.html)
