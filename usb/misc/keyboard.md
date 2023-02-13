# 键盘唤醒问题

因此，英特尔的100系列及更新的芯片组有一个奇怪的bug，即有时macOS需要第二次按键盘或其他唤醒事件来启动显示器，有些需要按键+电源按钮才能唤醒。要解决这个问题，我们需要:

* [将`acpi-wake-type`设置为USB控制器(推荐)](#method-1-add-wake-type-property-recommended)
* [创建一个假ACPI设备](#method-2-create-a-fake-acpi-device)
* [禁用darkwake(不理想，因为后台任务也会打开显示)](#method-3-configuring-darkwake)

你可以在这里找到关于整个情况和修复的伟大的文章:[USB修复](https://osy.gitbook.io/hac-mini-guide/details/usb-fix).

这是一本优秀的读物，强烈推荐你去真正理解**到底发生了什么**，而且这篇指南似乎还没有让你读够

## 方法1 -添加唤醒类型属性(推荐)

因此，理想的方法是将XHCI控制器(这是我们的USB控制器)声明为ACPI唤醒设备，因为我们没有macOS的兼容ec来处理正确的唤醒调用。以上翻译结果来自有道神经网络翻译（YNMT）· 通用领域

首先，我们需要获取USB控制器的PciRoot(我们将使用[gfxutil](https://github.com/acidanthera/gfxutil/releases)，通常名称是XHC, XHC1和XHCI)

![](../../images/post-install/usb-md/xhci-path.png)

现在使用PciRoot，打开您的config.plist，并在DeviceProperties -> add下添加一个新条目，并添加您的PciRoot。然后创建一个具有以下属性的子节点:

`acpi-wake-type | Data | <01>`

![](../../images/post-install/usb-md/deviceproperties.png)

## 方法2 -创建一个假ACPI设备

这个方法创建一个与GPE关联的假ACPI设备，然后用USBWakeFixup.kext添加`ACPI-wake-type`属性。

它实际上很容易设置，你将需要以下内容:

* [USBWakeFixup.kext](https://github.com/osy86/USBWakeFixup/releases)
  * 在EFI/OC/ kext和config.plist下
* [SSDT-USBW.dsl](https://github.com/osy86/USBWakeFixup/blob/master/SSDT-USBW.dsl)

要为特定的系统创建SSDT-USBW，需要USB控制器的ACPI路径。如果我们回顾上面的gfxutil示例，我们可以看到它还列出了我们的ACPI路径:

* `/PC00@0/XHCI@14` -> `\_SB.PC00.XHCI`

现在我们可以把它塞进我们的SSDT:

![](../../images/post-install/usb-md/usbw.png)

现在，您可以编译并将其添加到您的EFI和config.plist中。有关编译ssdt的更多信息，请参见[ACPI入门](https://sumingyd.github.io/Getting-Started-With-ACPI/Manual/compile.html)

## 方法3 -配置darkwake

在我们深入配置darkwake之前，最好解释一下什么是darkwake。霍利菲尔德的一篇深度文章可以在这里找到:[DarkWake on macOS Catalina](https://www.insanelymac.com/forum/topic/342002-darkwake-on-macos-catalina-boot-args-darkwake8-darkwake10-are-obsolete/)

在其最简单的形式中，您可以将darkwake视为“部分唤醒”，在这种情况下，只有硬件的某些部分为维护任务而亮起，而其他部分则处于睡眠状态(例如:显示)。我们关心这一点的原因可能是，darkwake可以在唤醒过程中添加额外的步骤，如按键盘，但直接禁用它会使我们的黑苹果唤醒随机。所以理想情况下，我们会通过下表找到一个理想值。

现在让我们看一下[IOPMrootDomain的源代码](https://opensource.apple.com/source/xnu/xnu-6153.81.5/iokit/Kernel/IOPMrootDomain.cpp.auto.html):

```cpp
// gDarkWakeFlags
enum {
    kDarkWakeFlagHIDTickleEarly      = 0x01, // hid tickle before gfx suppression
    kDarkWakeFlagHIDTickleLate       = 0x02, // hid tickle after gfx suppression
    kDarkWakeFlagHIDTickleNone       = 0x03, // hid tickle is not posted
    kDarkWakeFlagHIDTickleMask       = 0x03,
    kDarkWakeFlagAlarmIsDark         = 0x0100,
    kDarkWakeFlagGraphicsPowerState1 = 0x0200,
    kDarkWakeFlagAudioNotSuppressed  = 0x0400
};
```

现在让我们逐一检查每一位:

| Bit | Name | Comment |
| :--- | :--- | :--- |
| 0 | N/A |  据说会使darkwake失效 |
| 1 | HID Tickle Early | 帮助从盖子唤醒，另外可能需要电源按钮按下唤醒 |
| 2 | HID Tickle Late | 帮助单按键唤醒，但禁用自动休眠 |
| 3 | HID Tickle None | 如果设置为none，则默认darkwake值|
| 3 | HID Tickle Mask | 配对:与其他配对 |
| 256 | Alarm Is Dark | 有待探索 |
| 512 | Graphics Power State 1 | 使wranglerTickled完全从休眠和RTC唤醒 |
| 1024 | Audio Not Suppressed | 据说有助于消除醒来后的声音消失 |

* 注意HID =人机界面设备(键盘、鼠标、指针设备等)

要将上述表格应用于您的系统，就像获取计算器一样简单，将所需的darkwake值相加，然后将最终值应用于您的启动参数。但是，我们建议每次尝试一个，而不是一次合并所有，除非你知道你在做什么(尽管你可能不会阅读这篇指南)。

对于这个例子，让我们尝试组合`kdarkwakeflaghidtickklelate`和`kDarkWakeFlagGraphicsPowerState1`:

* `2`= kDarkWakeFlagHIDTickleLate
* `512`= kDarkWakeFlagAudioNotSuppressed

所以我们的最终值是`darkwake=514`，我们可以把它放到引导参数中:

```
NVRAM
|---Add
  |---7C436110-AB2A-4BBB-A880-FE41995C9F82
    |---boot-args | Sting | darkwake=514
```

下面更多是为了澄清已经使用darkwake或正在研究它的用户，特别是澄清哪些值不再工作:

* `darkwake=8`: 自从[Mavericks](https://opensource.apple.com/source/xnu/xnu-2422.115.4/iokit/Kernel/IOPMrootDomain.cpp.auto.html)之后，内核中就没有这个功能了。
  * 正确的引导参数是`darkwake=0`
* `darkwake=10`: 自从[Mavericks](https://opensource.apple.com/source/xnu/xnu-2422.115.4/iokit/Kernel/IOPMrootDomain.cpp.auto.html)之后，内核中就没有这个功能了。
  * 正确的引导参数是`darkwake=2`
