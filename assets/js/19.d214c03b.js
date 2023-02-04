(window.webpackJsonp=window.webpackJsonp||[]).push([[19],{428:function(e,t,a){e.exports=a.p+"assets/img/xhci-path.9ea32874.png"},429:function(e,t,a){e.exports=a.p+"assets/img/deviceproperties.c89d2c51.png"},430:function(e,t,a){e.exports=a.p+"assets/img/usbw.5e2e6a44.png"},479:function(e,t,a){"use strict";a.r(t);var r=a(10),o=Object(r.a)({},(function(){var e=this,t=e._self._c;return t("ContentSlotsDistributor",{attrs:{"slot-key":e.$parent.slotKey}},[t("h1",{attrs:{id:"keyboard-wake-issues"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#keyboard-wake-issues"}},[e._v("#")]),e._v(" Keyboard Wake Issues")]),e._v(" "),t("p",[e._v("So an odd bug with Intel's 100 series chipsets and newer is that sometimes macOS requires a second keyboard press or some other wake event to power up the monitor as well, with some requiring a keypress+power button to wake. Well to fix this, we need to either:")]),e._v(" "),t("ul",[t("li",[t("a",{attrs:{href:"#method-1-add-wake-type-property-recommended"}},[e._v("Set "),t("code",[e._v("acpi-wake-type")]),e._v(" to the USB Controller(Recommended)")])]),e._v(" "),t("li",[t("a",{attrs:{href:"#method-2-create-a-fake-acpi-device"}},[e._v("Create a fake ACPI Device")])]),e._v(" "),t("li",[t("a",{attrs:{href:"#method-3-configuring-darkwake"}},[e._v("Disable darkwake(not ideal, as background tasks will also turn on the display)")])])]),e._v(" "),t("p",[e._v("You can find a great write up on the whole situation and the fixes here: "),t("a",{attrs:{href:"https://osy.gitbook.io/hac-mini-guide/details/usb-fix",target:"_blank",rel:"noopener noreferrer"}},[e._v("USB Fix"),t("OutboundLink")],1),e._v(".")]),e._v(" "),t("p",[e._v("It's an excellent read and highly recommend to truly understand "),t("em",[e._v("what")]),e._v(" is exactly happening, and it's not like you've done enough reading already with this guide ;p")]),e._v(" "),t("h2",{attrs:{id:"method-1-add-wake-type-property-recommended"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#method-1-add-wake-type-property-recommended"}},[e._v("#")]),e._v(" Method 1 - Add Wake Type Property (Recommended)")]),e._v(" "),t("p",[e._v("So the ideal method is to declare the XHCI Controller(This is our USB Controller) to be an ACPI wake device, as we don't have compatible ECs for macOS to handle proper wake calls.")]),e._v(" "),t("p",[e._v("To start,  we'll need to grab the PciRoot of our USB Controller(we'll use "),t("a",{attrs:{href:"https://github.com/acidanthera/gfxutil/releases",target:"_blank",rel:"noopener noreferrer"}},[e._v("gfxutil"),t("OutboundLink")],1),e._v(", Generally the names would be XHC, XHC1 and XHCI)")]),e._v(" "),t("p",[t("img",{attrs:{src:a(428),alt:""}})]),e._v(" "),t("p",[e._v("Now with the PciRoot, open your config.plist and add a new entry under DeviceProperties -> Add, and add your PciRoot. Then create a child with the following attributes:")]),e._v(" "),t("p",[t("code",[e._v("acpi-wake-type | Data | <01>")])]),e._v(" "),t("p",[t("img",{attrs:{src:a(429),alt:""}})]),e._v(" "),t("h2",{attrs:{id:"method-2-create-a-fake-acpi-device"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#method-2-create-a-fake-acpi-device"}},[e._v("#")]),e._v(" Method 2 - Create a fake ACPI Device")]),e._v(" "),t("p",[e._v("This method creates a fake ACPI Device that will be associated with the GPE, then add the property of "),t("code",[e._v("acpi-wake-type")]),e._v(" with USBWakeFixup.kext.")]),e._v(" "),t("p",[e._v("It's actually quite easy to setup, you'll need the following:")]),e._v(" "),t("ul",[t("li",[t("a",{attrs:{href:"https://github.com/osy86/USBWakeFixup/releases",target:"_blank",rel:"noopener noreferrer"}},[e._v("USBWakeFixup.kext"),t("OutboundLink")],1),e._v(" "),t("ul",[t("li",[e._v("Both under EFI/OC/Kexts and your config.plist")])])]),e._v(" "),t("li",[t("a",{attrs:{href:"https://github.com/osy86/USBWakeFixup/blob/master/SSDT-USBW.dsl",target:"_blank",rel:"noopener noreferrer"}},[e._v("SSDT-USBW.dsl"),t("OutboundLink")],1)])]),e._v(" "),t("p",[e._v("To create the SSDT-USBW for your specific system, you're gonna need the ACPI path of your USB controller. If we look back above to the gfxutil example, we can see it also lists our ACPI path:")]),e._v(" "),t("ul",[t("li",[t("code",[e._v("/PC00@0/XHCI@14")]),e._v(" -> "),t("code",[e._v("\\_SB.PC00.XHCI")])])]),e._v(" "),t("p",[e._v("Now we can shove that into our SSDT:")]),e._v(" "),t("p",[t("img",{attrs:{src:a(430),alt:""}})]),e._v(" "),t("p",[e._v("Now with that done, you can compile and add it to your EFI and config.plist. See "),t("a",{attrs:{href:"https://dortania.github.io/Getting-Started-With-ACPI/Manual/compile.html",target:"_blank",rel:"noopener noreferrer"}},[e._v("Getting Started With ACPI"),t("OutboundLink")],1),e._v(" for more info on compiling SSDTs")]),e._v(" "),t("h2",{attrs:{id:"method-3-configuring-darkwake"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#method-3-configuring-darkwake"}},[e._v("#")]),e._v(" Method 3 - Configuring darkwake")]),e._v(" "),t("p",[e._v("Before we get deep into configuring darkwake, it would be best to explain what darkwake is. A great in-depth thread by holyfield can be found here: "),t("a",{attrs:{href:"https://www.insanelymac.com/forum/topic/342002-darkwake-on-macos-catalina-boot-args-darkwake8-darkwake10-are-obsolete/",target:"_blank",rel:"noopener noreferrer"}},[e._v("DarkWake on macOS Catalina"),t("OutboundLink")],1)]),e._v(" "),t("p",[e._v('In its simplest form, you can think of darkwake as "partial wake", where only certain parts of your hardware are lit up for maintenance tasks while others remain asleep(ie. Display). Reason we may care about this is that darkwake can add extra steps to the wake process like keyboard press, but outright disabling it can make our hack wake randomly. So ideally we\'d go through the below table to find an ideal value.')]),e._v(" "),t("p",[e._v("Now lets take a look at "),t("a",{attrs:{href:"https://opensource.apple.com/source/xnu/xnu-6153.81.5/iokit/Kernel/IOPMrootDomain.cpp.auto.html",target:"_blank",rel:"noopener noreferrer"}},[e._v("IOPMrootDomain's source code"),t("OutboundLink")],1),e._v(":")]),e._v(" "),t("div",{staticClass:"language-cpp extra-class"},[t("pre",{pre:!0,attrs:{class:"language-cpp"}},[t("code",[t("span",{pre:!0,attrs:{class:"token comment"}},[e._v("// gDarkWakeFlags")]),e._v("\n"),t("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("enum")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("{")]),e._v("\n    kDarkWakeFlagHIDTickleEarly      "),t("span",{pre:!0,attrs:{class:"token operator"}},[e._v("=")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token number"}},[e._v("0x01")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(",")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token comment"}},[e._v("// hid tickle before gfx suppression")]),e._v("\n    kDarkWakeFlagHIDTickleLate       "),t("span",{pre:!0,attrs:{class:"token operator"}},[e._v("=")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token number"}},[e._v("0x02")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(",")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token comment"}},[e._v("// hid tickle after gfx suppression")]),e._v("\n    kDarkWakeFlagHIDTickleNone       "),t("span",{pre:!0,attrs:{class:"token operator"}},[e._v("=")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token number"}},[e._v("0x03")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(",")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token comment"}},[e._v("// hid tickle is not posted")]),e._v("\n    kDarkWakeFlagHIDTickleMask       "),t("span",{pre:!0,attrs:{class:"token operator"}},[e._v("=")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token number"}},[e._v("0x03")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(",")]),e._v("\n    kDarkWakeFlagAlarmIsDark         "),t("span",{pre:!0,attrs:{class:"token operator"}},[e._v("=")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token number"}},[e._v("0x0100")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(",")]),e._v("\n    kDarkWakeFlagGraphicsPowerState1 "),t("span",{pre:!0,attrs:{class:"token operator"}},[e._v("=")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token number"}},[e._v("0x0200")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(",")]),e._v("\n    kDarkWakeFlagAudioNotSuppressed  "),t("span",{pre:!0,attrs:{class:"token operator"}},[e._v("=")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token number"}},[e._v("0x0400")]),e._v("\n"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("}")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(";")]),e._v("\n")])])]),t("p",[e._v("Now lets go through each bit:")]),e._v(" "),t("table",[t("thead",[t("tr",[t("th",{staticStyle:{"text-align":"left"}},[e._v("Bit")]),e._v(" "),t("th",{staticStyle:{"text-align":"left"}},[e._v("Name")]),e._v(" "),t("th",{staticStyle:{"text-align":"left"}},[e._v("Comment")])])]),e._v(" "),t("tbody",[t("tr",[t("td",{staticStyle:{"text-align":"left"}},[e._v("0")]),e._v(" "),t("td",{staticStyle:{"text-align":"left"}},[e._v("N/A")]),e._v(" "),t("td",{staticStyle:{"text-align":"left"}},[e._v("Supposedly disables darkwake")])]),e._v(" "),t("tr",[t("td",{staticStyle:{"text-align":"left"}},[e._v("1")]),e._v(" "),t("td",{staticStyle:{"text-align":"left"}},[e._v("HID Tickle Early")]),e._v(" "),t("td",{staticStyle:{"text-align":"left"}},[e._v("Helps with wake from lid, may require pwr-button press to wake in addition")])]),e._v(" "),t("tr",[t("td",{staticStyle:{"text-align":"left"}},[e._v("2")]),e._v(" "),t("td",{staticStyle:{"text-align":"left"}},[e._v("HID Tickle Late")]),e._v(" "),t("td",{staticStyle:{"text-align":"left"}},[e._v("Helps single keypress wake but disables auto-sleep")])]),e._v(" "),t("tr",[t("td",{staticStyle:{"text-align":"left"}},[e._v("3")]),e._v(" "),t("td",{staticStyle:{"text-align":"left"}},[e._v("HID Tickle None")]),e._v(" "),t("td",{staticStyle:{"text-align":"left"}},[e._v("Default darkwake value if none is set")])]),e._v(" "),t("tr",[t("td",{staticStyle:{"text-align":"left"}},[e._v("3")]),e._v(" "),t("td",{staticStyle:{"text-align":"left"}},[e._v("HID Tickle Mask")]),e._v(" "),t("td",{staticStyle:{"text-align":"left"}},[e._v("To be paired with other")])]),e._v(" "),t("tr",[t("td",{staticStyle:{"text-align":"left"}},[e._v("256")]),e._v(" "),t("td",{staticStyle:{"text-align":"left"}},[e._v("Alarm Is Dark")]),e._v(" "),t("td",{staticStyle:{"text-align":"left"}},[e._v("To be explored")])]),e._v(" "),t("tr",[t("td",{staticStyle:{"text-align":"left"}},[e._v("512")]),e._v(" "),t("td",{staticStyle:{"text-align":"left"}},[e._v("Graphics Power State 1")]),e._v(" "),t("td",{staticStyle:{"text-align":"left"}},[e._v("Enables wranglerTickled to wake fully from hibernation and RTC")])]),e._v(" "),t("tr",[t("td",{staticStyle:{"text-align":"left"}},[e._v("1024")]),e._v(" "),t("td",{staticStyle:{"text-align":"left"}},[e._v("Audio Not Suppressed")]),e._v(" "),t("td",{staticStyle:{"text-align":"left"}},[e._v("Supposedly helps with audio disappearing after wake")])])])]),e._v(" "),t("ul",[t("li",[e._v("Note that HID = Human-interface devices(Keyboards, mice, pointing devices, etc)")])]),e._v(" "),t("p",[e._v("To apply the above table to your system, it's as simple as grabbing calculator, adding up your desired darkwake values and then applying the final value to your boot-args. However we recommend trying 1 at a time rather than merging all at once, unless you know what you're doing(though you likely wouldn't be reading this guide).")]),e._v(" "),t("p",[e._v("For this example, lets try and combine "),t("code",[e._v("kDarkWakeFlagHIDTickleLate")]),e._v(" and "),t("code",[e._v("kDarkWakeFlagGraphicsPowerState1")]),e._v(":")]),e._v(" "),t("ul",[t("li",[t("code",[e._v("2")]),e._v("= kDarkWakeFlagHIDTickleLate")]),e._v(" "),t("li",[t("code",[e._v("512")]),e._v("= kDarkWakeFlagAudioNotSuppressed")])]),e._v(" "),t("p",[e._v("So our final value would be "),t("code",[e._v("darkwake=514")]),e._v(", which we can next place into boot-args:")]),e._v(" "),t("div",{staticClass:"language- extra-class"},[t("pre",{pre:!0,attrs:{class:"language-text"}},[t("code",[e._v("NVRAM\n|---Add\n  |---7C436110-AB2A-4BBB-A880-FE41995C9F82\n    |---boot-args | Sting | darkwake=514\n")])])]),t("p",[e._v("The below is more for clarification for users who are already using darkwake or are looking into it, specifically clarifying what values no longer work:")]),e._v(" "),t("ul",[t("li",[t("code",[e._v("darkwake=8")]),e._v(": This hasn't been in the kernel since "),t("a",{attrs:{href:"https://opensource.apple.com/source/xnu/xnu-2422.115.4/iokit/Kernel/IOPMrootDomain.cpp.auto.html",target:"_blank",rel:"noopener noreferrer"}},[e._v("Mavericks"),t("OutboundLink")],1),e._v(" "),t("ul",[t("li",[e._v("Correct boot-arg would be "),t("code",[e._v("darkwake=0")])])])]),e._v(" "),t("li",[t("code",[e._v("darkwake=10")]),e._v(": This hasn't been in the kernel since "),t("a",{attrs:{href:"https://opensource.apple.com/source/xnu/xnu-2422.115.4/iokit/Kernel/IOPMrootDomain.cpp.auto.html",target:"_blank",rel:"noopener noreferrer"}},[e._v("Mavericks"),t("OutboundLink")],1),e._v(" "),t("ul",[t("li",[e._v("Correct boot-arg would be "),t("code",[e._v("darkwake=2")])])])])])])}),[],!1,null,null,null);t.default=o.exports}}]);