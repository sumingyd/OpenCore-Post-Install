(window.webpackJsonp=window.webpackJsonp||[]).push([[19],{428:function(t,e,a){t.exports=a.p+"assets/img/xhci-path.9ea32874.png"},429:function(t,e,a){t.exports=a.p+"assets/img/deviceproperties.c89d2c51.png"},430:function(t,e,a){t.exports=a.p+"assets/img/usbw.5e2e6a44.png"},479:function(t,e,a){"use strict";a.r(e);var r=a(10),s=Object(r.a)({},(function(){var t=this,e=t._self._c;return e("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[e("h1",{attrs:{id:"键盘唤醒问题"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#键盘唤醒问题"}},[t._v("#")]),t._v(" 键盘唤醒问题")]),t._v(" "),e("p",[t._v("因此，英特尔的100系列及更新的芯片组有一个奇怪的bug，即有时macOS需要第二次按键盘或其他唤醒事件来启动显示器，有些需要按键+电源按钮才能唤醒。要解决这个问题，我们需要:")]),t._v(" "),e("ul",[e("li",[e("a",{attrs:{href:"#method-1-add-wake-type-property-recommended"}},[t._v("将"),e("code",[t._v("acpi-wake-type")]),t._v("设置为USB控制器(推荐)")])]),t._v(" "),e("li",[e("a",{attrs:{href:"#method-2-create-a-fake-acpi-device"}},[t._v("创建一个假ACPI设备")])]),t._v(" "),e("li",[e("a",{attrs:{href:"#method-3-configuring-darkwake"}},[t._v("禁用darkwake(不理想，因为后台任务也会打开显示)")])])]),t._v(" "),e("p",[t._v("你可以在这里找到关于整个情况和修复的伟大的文章:"),e("a",{attrs:{href:"https://osy.gitbook.io/hac-mini-guide/details/usb-fix",target:"_blank",rel:"noopener noreferrer"}},[t._v("USB修复"),e("OutboundLink")],1),t._v(".")]),t._v(" "),e("p",[t._v("这是一本优秀的读物，强烈推荐你去真正理解"),e("strong",[t._v("到底发生了什么")]),t._v("，而且这篇指南似乎还没有让你读够")]),t._v(" "),e("h2",{attrs:{id:"方法1-添加唤醒类型属性-推荐"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#方法1-添加唤醒类型属性-推荐"}},[t._v("#")]),t._v(" 方法1 -添加唤醒类型属性(推荐)")]),t._v(" "),e("p",[t._v("因此，理想的方法是将XHCI控制器(这是我们的USB控制器)声明为ACPI唤醒设备，因为我们没有macOS的兼容ec来处理正确的唤醒调用。以上翻译结果来自有道神经网络翻译（YNMT）· 通用领域")]),t._v(" "),e("p",[t._v("首先，我们需要获取USB控制器的PciRoot(我们将使用"),e("a",{attrs:{href:"https://github.com/acidanthera/gfxutil/releases",target:"_blank",rel:"noopener noreferrer"}},[t._v("gfxutil"),e("OutboundLink")],1),t._v("，通常名称是XHC, XHC1和XHCI)")]),t._v(" "),e("p",[e("img",{attrs:{src:a(428),alt:""}})]),t._v(" "),e("p",[t._v("现在使用PciRoot，打开您的config.plist，并在DeviceProperties -> add下添加一个新条目，并添加您的PciRoot。然后创建一个具有以下属性的子节点:")]),t._v(" "),e("p",[e("code",[t._v("acpi-wake-type | Data | <01>")])]),t._v(" "),e("p",[e("img",{attrs:{src:a(429),alt:""}})]),t._v(" "),e("h2",{attrs:{id:"方法2-创建一个假acpi设备"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#方法2-创建一个假acpi设备"}},[t._v("#")]),t._v(" 方法2 -创建一个假ACPI设备")]),t._v(" "),e("p",[t._v("这个方法创建一个与GPE关联的假ACPI设备，然后用USBWakeFixup.kext添加"),e("code",[t._v("ACPI-wake-type")]),t._v("属性。")]),t._v(" "),e("p",[t._v("它实际上很容易设置，你将需要以下内容:")]),t._v(" "),e("ul",[e("li",[e("a",{attrs:{href:"https://github.com/osy86/USBWakeFixup/releases",target:"_blank",rel:"noopener noreferrer"}},[t._v("USBWakeFixup.kext"),e("OutboundLink")],1),t._v(" "),e("ul",[e("li",[t._v("在EFI/OC/ kext和config.plist下")])])]),t._v(" "),e("li",[e("a",{attrs:{href:"https://github.com/osy86/USBWakeFixup/blob/master/SSDT-USBW.dsl",target:"_blank",rel:"noopener noreferrer"}},[t._v("SSDT-USBW.dsl"),e("OutboundLink")],1)])]),t._v(" "),e("p",[t._v("要为特定的系统创建SSDT-USBW，需要USB控制器的ACPI路径。如果我们回顾上面的gfxutil示例，我们可以看到它还列出了我们的ACPI路径:")]),t._v(" "),e("ul",[e("li",[e("code",[t._v("/PC00@0/XHCI@14")]),t._v(" -> "),e("code",[t._v("\\_SB.PC00.XHCI")])])]),t._v(" "),e("p",[t._v("现在我们可以把它塞进我们的SSDT:")]),t._v(" "),e("p",[e("img",{attrs:{src:a(430),alt:""}})]),t._v(" "),e("p",[t._v("现在，您可以编译并将其添加到您的EFI和config.plist中。有关编译ssdt的更多信息，请参见"),e("a",{attrs:{href:"https://sumingyd.github.io/Getting-Started-With-ACPI/Manual/compile.html",target:"_blank",rel:"noopener noreferrer"}},[t._v("ACPI入门"),e("OutboundLink")],1)]),t._v(" "),e("h2",{attrs:{id:"方法3-配置darkwake"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#方法3-配置darkwake"}},[t._v("#")]),t._v(" 方法3 -配置darkwake")]),t._v(" "),e("p",[t._v("在我们深入配置darkwake之前，最好解释一下什么是darkwake。霍利菲尔德的一篇深度文章可以在这里找到:"),e("a",{attrs:{href:"https://www.insanelymac.com/forum/topic/342002-darkwake-on-macos-catalina-boot-args-darkwake8-darkwake10-are-obsolete/",target:"_blank",rel:"noopener noreferrer"}},[t._v("DarkWake on macOS Catalina"),e("OutboundLink")],1)]),t._v(" "),e("p",[t._v("在其最简单的形式中，您可以将darkwake视为“部分唤醒”，在这种情况下，只有硬件的某些部分为维护任务而亮起，而其他部分则处于睡眠状态(例如:显示)。我们关心这一点的原因可能是，darkwake可以在唤醒过程中添加额外的步骤，如按键盘，但直接禁用它会使我们的黑苹果唤醒随机。所以理想情况下，我们会通过下表找到一个理想值。")]),t._v(" "),e("p",[t._v("现在让我们看一下"),e("a",{attrs:{href:"https://opensource.apple.com/source/xnu/xnu-6153.81.5/iokit/Kernel/IOPMrootDomain.cpp.auto.html",target:"_blank",rel:"noopener noreferrer"}},[t._v("IOPMrootDomain的源代码"),e("OutboundLink")],1),t._v(":")]),t._v(" "),e("div",{staticClass:"language-cpp extra-class"},[e("pre",{pre:!0,attrs:{class:"language-cpp"}},[e("code",[e("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// gDarkWakeFlags")]),t._v("\n"),e("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("enum")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    kDarkWakeFlagHIDTickleEarly      "),e("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token number"}},[t._v("0x01")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// hid tickle before gfx suppression")]),t._v("\n    kDarkWakeFlagHIDTickleLate       "),e("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token number"}},[t._v("0x02")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// hid tickle after gfx suppression")]),t._v("\n    kDarkWakeFlagHIDTickleNone       "),e("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token number"}},[t._v("0x03")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// hid tickle is not posted")]),t._v("\n    kDarkWakeFlagHIDTickleMask       "),e("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token number"}},[t._v("0x03")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n    kDarkWakeFlagAlarmIsDark         "),e("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token number"}},[t._v("0x0100")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n    kDarkWakeFlagGraphicsPowerState1 "),e("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token number"}},[t._v("0x0200")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n    kDarkWakeFlagAudioNotSuppressed  "),e("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token number"}},[t._v("0x0400")]),t._v("\n"),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])])]),e("p",[t._v("现在让我们逐一检查每一位:")]),t._v(" "),e("table",[e("thead",[e("tr",[e("th",{staticStyle:{"text-align":"left"}},[t._v("Bit")]),t._v(" "),e("th",{staticStyle:{"text-align":"left"}},[t._v("Name")]),t._v(" "),e("th",{staticStyle:{"text-align":"left"}},[t._v("Comment")])])]),t._v(" "),e("tbody",[e("tr",[e("td",{staticStyle:{"text-align":"left"}},[t._v("0")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("N/A")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("据说会使darkwake失效")])]),t._v(" "),e("tr",[e("td",{staticStyle:{"text-align":"left"}},[t._v("1")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("HID Tickle Early")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("帮助从盖子唤醒，另外可能需要电源按钮按下唤醒")])]),t._v(" "),e("tr",[e("td",{staticStyle:{"text-align":"left"}},[t._v("2")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("HID Tickle Late")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("帮助单按键唤醒，但禁用自动休眠")])]),t._v(" "),e("tr",[e("td",{staticStyle:{"text-align":"left"}},[t._v("3")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("HID Tickle None")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("如果设置为none，则默认darkwake值")])]),t._v(" "),e("tr",[e("td",{staticStyle:{"text-align":"left"}},[t._v("3")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("HID Tickle Mask")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("配对:与其他配对")])]),t._v(" "),e("tr",[e("td",{staticStyle:{"text-align":"left"}},[t._v("256")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("Alarm Is Dark")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("有待探索")])]),t._v(" "),e("tr",[e("td",{staticStyle:{"text-align":"left"}},[t._v("512")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("Graphics Power State 1")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("使wranglerTickled完全从休眠和RTC唤醒")])]),t._v(" "),e("tr",[e("td",{staticStyle:{"text-align":"left"}},[t._v("1024")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("Audio Not Suppressed")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("据说有助于消除醒来后的声音消失")])])])]),t._v(" "),e("ul",[e("li",[t._v("注意HID =人机界面设备(键盘、鼠标、指针设备等)")])]),t._v(" "),e("p",[t._v("要将上述表格应用于您的系统，就像获取计算器一样简单，将所需的darkwake值相加，然后将最终值应用于您的启动参数。但是，我们建议每次尝试一个，而不是一次合并所有，除非你知道你在做什么(尽管你可能不会阅读这篇指南)。")]),t._v(" "),e("p",[t._v("对于这个例子，让我们尝试组合"),e("code",[t._v("kdarkwakeflaghidtickklelate")]),t._v("和"),e("code",[t._v("kDarkWakeFlagGraphicsPowerState1")]),t._v(":")]),t._v(" "),e("ul",[e("li",[e("code",[t._v("2")]),t._v("= kDarkWakeFlagHIDTickleLate")]),t._v(" "),e("li",[e("code",[t._v("512")]),t._v("= kDarkWakeFlagAudioNotSuppressed")])]),t._v(" "),e("p",[t._v("所以我们的最终值是"),e("code",[t._v("darkwake=514")]),t._v("，我们可以把它放到引导参数中:")]),t._v(" "),e("div",{staticClass:"language- extra-class"},[e("pre",{pre:!0,attrs:{class:"language-text"}},[e("code",[t._v("NVRAM\n|---Add\n  |---7C436110-AB2A-4BBB-A880-FE41995C9F82\n    |---boot-args | Sting | darkwake=514\n")])])]),e("p",[t._v("下面更多是为了澄清已经使用darkwake或正在研究它的用户，特别是澄清哪些值不再工作:")]),t._v(" "),e("ul",[e("li",[e("code",[t._v("darkwake=8")]),t._v(": 自从"),e("a",{attrs:{href:"https://opensource.apple.com/source/xnu/xnu-2422.115.4/iokit/Kernel/IOPMrootDomain.cpp.auto.html",target:"_blank",rel:"noopener noreferrer"}},[t._v("Mavericks"),e("OutboundLink")],1),t._v("之后，内核中就没有这个功能了。\n"),e("ul",[e("li",[t._v("正确的引导参数是"),e("code",[t._v("darkwake=0")])])])]),t._v(" "),e("li",[e("code",[t._v("darkwake=10")]),t._v(": 自从"),e("a",{attrs:{href:"https://opensource.apple.com/source/xnu/xnu-2422.115.4/iokit/Kernel/IOPMrootDomain.cpp.auto.html",target:"_blank",rel:"noopener noreferrer"}},[t._v("Mavericks"),e("OutboundLink")],1),t._v("之后，内核中就没有这个功能了。\n"),e("ul",[e("li",[t._v("正确的引导参数是"),e("code",[t._v("darkwake=2")])])])])])])}),[],!1,null,null,null);e.default=s.exports}}]);