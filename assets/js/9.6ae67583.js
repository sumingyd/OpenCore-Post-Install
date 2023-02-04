(window.webpackJsonp=window.webpackJsonp||[]).push([[9],{301:function(t,e,a){t.exports=a.p+"assets/img/nvcap-start.b660db12.jpg"},302:function(t,e,a){t.exports=a.p+"assets/img/nvcap-initial-nvcap.eaa16836.jpg"},303:function(t,e,a){t.exports=a.p+"assets/img/nvcap-assign-entry.60b25e44.jpg"},304:function(t,e,a){t.exports=a.p+"assets/img/nvcap-complete-displays.edafb12a.jpg"},305:function(t,e,a){t.exports=a.p+"assets/img/nvcap-calculated.536db785.jpg"},306:function(t,e,a){t.exports=a.p+"assets/img/deviceproperties.9f5b6d8a.png"},451:function(t,e,a){"use strict";a.r(e);var l=a(10),i=Object(l.a)({},(function(){var t=this,e=t._self._c;return e("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[e("h1",{attrs:{id:"legacy-nvidia-patching"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#legacy-nvidia-patching"}},[t._v("#")]),t._v(" Legacy Nvidia Patching")]),t._v(" "),e("ul",[e("li",[t._v("Please note this page is more of an info dump, we won't be going to too great of detail on setup though we plan to expand this page more for it.")])]),t._v(" "),e("p",[t._v("With legacy Nvidia GPUs, macOS has difficulties enabling acceleration due to many missing properties. To work around this, we can inject properties into IOService for macOS to easily interpret.")]),t._v(" "),e("p",[t._v("To start off, we'll be assuming the following:")]),t._v(" "),e("ul",[e("li",[t._v("macOS has already been installed in some way\n"),e("ul",[e("li",[t._v("We need macOS installed to determine certain properties")])])]),t._v(" "),e("li",[t._v("Your GPU is either Fermi or older\n"),e("ul",[e("li",[t._v("Kepler and newer "),e("strong",[t._v("do not")]),t._v(" need Device Property injection")])])]),t._v(" "),e("li",[t._v("Lilu and WhateverGreen are loaded\n"),e("ul",[e("li",[t._v("verify by running "),e("code",[t._v('kextstat | grep -E "Lilu|WhateverGreen"')])])])])]),t._v(" "),e("h3",{attrs:{id:"finding-the-gpu-pathing"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#finding-the-gpu-pathing"}},[t._v("#")]),t._v(" Finding the GPU pathing")]),t._v(" "),e("p",[t._v("First lets grab "),e("a",{attrs:{href:"https://github.com/acidanthera/gfxutil/releases",target:"_blank",rel:"noopener noreferrer"}},[t._v("gfxutil"),e("OutboundLink")],1),t._v(" and run the following:")]),t._v(" "),e("div",{staticClass:"language- extra-class"},[e("pre",{pre:!0,attrs:{class:"language-text"}},[e("code",[t._v("path/to/gfxutil -f display\n")])])]),e("p",[t._v("This should spit out something like the following:")]),t._v(" "),e("div",{staticClass:"language- extra-class"},[e("pre",{pre:!0,attrs:{class:"language-text"}},[e("code",[t._v("67:00.0 10DE:0A20 /PC02@0/BR2A@0/GFX0@0/ = PciRoot(0x2)/Pci(0x0,0x0)/Pci(0x0,0x0)\n")])])]),e("p",[t._v("What we care about is the PciRoot section, as this is where our GPU is located and where we'll be injecting our properties:")]),t._v(" "),e("div",{staticClass:"language- extra-class"},[e("pre",{pre:!0,attrs:{class:"language-text"}},[e("code",[t._v("PciRoot(0x2)/Pci(0x0,0x0)/Pci(0x0,0x0)\n")])])]),e("h3",{attrs:{id:"building-our-deviceproperties"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#building-our-deviceproperties"}},[t._v("#")]),t._v(" Building our DeviceProperties")]),t._v(" "),e("p",[t._v("With Nvidia GPUs, there's actually not too many properties required for setup. The main ones that are recommended are the following:")]),t._v(" "),e("table",[e("thead",[e("tr",[e("th",{staticStyle:{"text-align":"left"}},[t._v("Property")]),t._v(" "),e("th",{staticStyle:{"text-align":"left"}},[t._v("Value")]),t._v(" "),e("th",{staticStyle:{"text-align":"left"}},[t._v("Comment")])])]),t._v(" "),e("tbody",[e("tr",[e("td",{staticStyle:{"text-align":"left"}},[t._v("model")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("ex. GeForce GT 220")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("GPU model name, cosmetic")])]),t._v(" "),e("tr",[e("td",{staticStyle:{"text-align":"left"}},[t._v("device_type")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("NVDA,Parent")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("Always set as "),e("code",[t._v("NVDA,Parent")])])]),t._v(" "),e("tr",[e("td",{staticStyle:{"text-align":"left"}},[t._v("VRAM,totalsize")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("ex. 0000004000000000")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("Sets VRAM size")])]),t._v(" "),e("tr",[e("td",{staticStyle:{"text-align":"left"}},[t._v("rom-revision")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("Dortania")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("Property must exist, however the value can be anything")])]),t._v(" "),e("tr",[e("td",{staticStyle:{"text-align":"left"}},[t._v("NVCAP")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("ex. 0500000000000F00000000000000000F00000000")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("sets display properties used by macOS, more info below")])]),t._v(" "),e("tr",[e("td",{staticStyle:{"text-align":"left"}},[t._v("@0,compatible")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("NVDA,NVMac")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("Always set as "),e("code",[t._v("NVDA,NVMac")])])]),t._v(" "),e("tr",[e("td",{staticStyle:{"text-align":"left"}},[t._v("@0,device_type")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("display")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("Always set as "),e("code",[t._v("display")])])]),t._v(" "),e("tr",[e("td",{staticStyle:{"text-align":"left"}},[t._v("@0,name")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("NVDA,Display-A")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("Always set as "),e("code",[t._v("NVDA,Display-A")])])]),t._v(" "),e("tr",[e("td",{staticStyle:{"text-align":"left"}},[t._v("@1,compatible")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("NVDA,NVMac")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("Always set as "),e("code",[t._v("NVDA,NVMac")])])]),t._v(" "),e("tr",[e("td",{staticStyle:{"text-align":"left"}},[t._v("@1,device_type")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("display")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("Always set as "),e("code",[t._v("display")])])]),t._v(" "),e("tr",[e("td",{staticStyle:{"text-align":"left"}},[t._v("@1,name")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("NVDA,Display-B")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("Always set as "),e("code",[t._v("NVDA,Display-B")])])])])]),t._v(" "),e("p",[t._v("And to calculate the properties few properties:")]),t._v(" "),e("ul",[e("li",[e("a",{attrs:{href:"#model"}},[t._v("model")])]),t._v(" "),e("li",[e("a",{attrs:{href:"#vram-totalsize"}},[t._v("VRAM,totalsize")])]),t._v(" "),e("li",[e("a",{attrs:{href:"#rom-revision"}},[t._v("rom-revision")])]),t._v(" "),e("li",[e("a",{attrs:{href:"#nvcap"}},[t._v("NVCAP")])])]),t._v(" "),e("h3",{attrs:{id:"model"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#model"}},[t._v("#")]),t._v(" model")]),t._v(" "),e("p",[t._v("Technically cosmetic, however macOS expects this entry so we'll provide it. The format is as follows:")]),t._v(" "),e("div",{staticClass:"language-md extra-class"},[e("pre",{pre:!0,attrs:{class:"language-md"}},[e("code",[t._v("GeForce [Device Name]\n"),e("span",{pre:!0,attrs:{class:"token title important"}},[e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("#")]),t._v(" Example")]),t._v("\nGeForce GT 220\n")])])]),e("h3",{attrs:{id:"vram-totalsize"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#vram-totalsize"}},[t._v("#")]),t._v(" VRAM,totalsize")]),t._v(" "),e("p",[t._v("Amount of VRAM present on your card, in hexadecimal.")]),t._v(" "),e("p",[t._v("For this example, lets convert 1024MB to hexadecimal:")]),t._v(" "),e("div",{staticClass:"language-md extra-class"},[e("pre",{pre:!0,attrs:{class:"language-md"}},[e("code",[e("span",{pre:!0,attrs:{class:"token title important"}},[e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("#")]),t._v(" Convert 1024MB Megabytes to Bytes")]),t._v("\necho '1024 "),e("span",{pre:!0,attrs:{class:"token italic"}},[e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("*")]),e("span",{pre:!0,attrs:{class:"token content"}},[t._v(" 1024 ")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("*")])]),t._v(" 1024' | bc\n 1073741824\n\n"),e("span",{pre:!0,attrs:{class:"token title important"}},[e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("#")]),t._v(" Convert from decimal to hexadecimal")]),t._v("\necho 'obase=16; ibase=10; 1073741824' | bc\n 40000000\n\n"),e("span",{pre:!0,attrs:{class:"token title important"}},[e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("#")]),t._v(" Hexswap so it can be injected correctly")]),t._v("\n"),e("span",{pre:!0,attrs:{class:"token title important"}},[e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("#")]),t._v(" ie. swap in pairs")]),t._v("\n40000000 -> 40 00 00 00 -> 00 00 00 40\n\n"),e("span",{pre:!0,attrs:{class:"token title important"}},[e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("#")]),t._v(" Pad the value to 8 bytes with 00 at the end")]),t._v("\n00 00 00 40 00 00 00 00\n\n"),e("span",{pre:!0,attrs:{class:"token title important"}},[e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("#")]),t._v(" And you're done")]),t._v("\nVRAM,totalsize = 0000004000000000\n")])])]),e("h3",{attrs:{id:"rom-revision"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#rom-revision"}},[t._v("#")]),t._v(" rom-revision")]),t._v(" "),e("p",[t._v("Simply can be any value, however the property must exist as some GPUs fail to initialize without it(ex. GT 220's)")]),t._v(" "),e("div",{staticClass:"language- extra-class"},[e("pre",{pre:!0,attrs:{class:"language-text"}},[e("code",[t._v("rom-revision = Dortania\n")])])]),e("h3",{attrs:{id:"nvcap"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#nvcap"}},[t._v("#")]),t._v(" NVCAP")]),t._v(" "),e("p",[t._v("This is where the fun comes it, as we'll now need to calculate the NVCAP value. Thankfully for us, 1Revenger1 has created a tool to automate the process: "),e("a",{attrs:{href:"https://github.com/1Revenger1/NVCAP-Calculator/releases",target:"_blank",rel:"noopener noreferrer"}},[t._v("NVCAP Calculator"),e("OutboundLink")],1)]),t._v(" "),e("p",[t._v("To use this program, simply grab your VBIOS("),e("a",{attrs:{href:"https://www.techpowerup.com/vgabios/",target:"_blank",rel:"noopener noreferrer"}},[t._v("TechPowerUp hosts most VBIOS"),e("OutboundLink")],1),t._v(") and run NVCAP-Calculator within your terminal.")]),t._v(" "),e("p",[t._v("Once its running, you should see the following:")]),t._v(" "),e("p",[e("img",{attrs:{src:a(301),alt:""}})]),t._v(" "),e("p",[t._v("Give it your VBIOS and then press enter. Once it takes you to the main menu, select option 2 to take you to the NVCAP calculation page.")]),t._v(" "),e("p",[e("img",{attrs:{src:a(302),alt:""}})]),t._v(" "),e("p",[t._v("Here you can see the connectors that NVCAP-Calculator was able to find. Each Display may represent multiple DCB Entries, such as DVI (normally represented as two entries) or duplicate DCB entries. The goal here is to assign each display to a head. Each head can only output to one display at a time. For example, if your using 2 DVI ports, each should be on their own head to have proper dual monitor support.")]),t._v(" "),e("p",[t._v("Note that some displays may be assigned automatically. An LVDS display will be put on it's own head automatically, and TV displays will be put on the TV head automatically.")]),t._v(" "),e("p",[t._v("To start assigning displays, press "),e("code",[t._v("1")]),t._v(". To assign a display to a head, you type the number of the display then the number of the head. For example, typing in "),e("code",[t._v("1 1")]),t._v(" results in:")]),t._v(" "),e("p",[e("img",{attrs:{src:a(303),alt:""}})]),t._v(" "),e("p",[t._v("You can type in "),e("code",[t._v("1 1")]),t._v(" again to remove the display from the head. Once you are done assigning displays, it should look something like this:")]),t._v(" "),e("p",[e("img",{attrs:{src:a(304),alt:""}})]),t._v(" "),e("p",[t._v("Once you are done setting up the displays, press "),e("code",[t._v("q")]),t._v(" to return to the other NVCAP settings. You should set the rest of the NVCAP settings as follows:")]),t._v(" "),e("table",[e("thead",[e("tr",[e("th",{staticStyle:{"text-align":"center"}},[t._v("NVCAP Value")]),t._v(" "),e("th",{staticStyle:{"text-align":"left"}},[t._v("Details")]),t._v(" "),e("th",{staticStyle:{"text-align":"left"}},[t._v("Example Command")])])]),t._v(" "),e("tbody",[e("tr",[e("td",{staticStyle:{"text-align":"center"}},[t._v("Version")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[e("code",[t._v("04")]),t._v(" for 7 series and older, "),e("code",[t._v("05")]),t._v(" for 8 series and newer")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[e("code",[t._v("3")]),t._v(" then "),e("code",[t._v("4")])])]),t._v(" "),e("tr",[e("td",{staticStyle:{"text-align":"center"}},[t._v("Composite")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[e("code",[t._v("01")]),t._v(" for S-Video, "),e("code",[t._v("00")]),t._v(" otherwise")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[e("code",[t._v("4")]),t._v(" to toggle")])]),t._v(" "),e("tr",[e("td",{staticStyle:{"text-align":"center"}},[t._v("Script based Power/Backlight")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[e("code",[t._v("00")]),t._v(" ony useful for genuine MacBook Pros")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[e("code",[t._v("3")]),t._v(" to toggle")])]),t._v(" "),e("tr",[e("td",{staticStyle:{"text-align":"center"}},[t._v("Field F (Unknown)")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[e("code",[t._v("0F")]),t._v(" for 300 series and newer, otherwise "),e("code",[t._v("07")])]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[e("code",[t._v("6")]),t._v(" then "),e("code",[t._v("0x0f")])])])])]),t._v(" "),e("p",[t._v("Once done, enter in "),e("code",[t._v("c")]),t._v(" to calculate the NVCAP value")]),t._v(" "),e("p",[e("img",{attrs:{src:a(305),alt:""}})]),t._v(" "),e("p",[t._v("You now have your NVCAP value!")]),t._v(" "),e("div",{staticClass:"language- extra-class"},[e("pre",{pre:!0,attrs:{class:"language-text"}},[e("code",[t._v("NVCAP: \n05000000 00000300 0c000000 0000000f 00000000\n")])])]),e("p",[t._v("For those who are wanting a break down on how to calculate the NVCAP value:")]),t._v(" "),e("details",{staticClass:"custom-block details"},[e("summary",[t._v("NVCAP Table")]),t._v(" "),e("p",[t._v("Info based off of "),e("a",{attrs:{href:"https://github.com/acidanthera/WhateverGreen/blob/master/Manual/NVCAP.bt",target:"_blank",rel:"noopener noreferrer"}},[t._v("WhateverGreen's NVCAP.bt file"),e("OutboundLink")],1)]),t._v(" "),e("table",[e("thead",[e("tr",[e("th",{staticStyle:{"text-align":"left"}},[t._v("NVCAP Bit")]),t._v(" "),e("th",{staticStyle:{"text-align":"left"}},[t._v("Name")]),t._v(" "),e("th",{staticStyle:{"text-align":"left"}},[t._v("Comment")])])]),t._v(" "),e("tbody",[e("tr",[e("td",{staticStyle:{"text-align":"left"}},[t._v("Byte 1")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("NVCAP Version")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[e("code",[t._v("04")]),t._v(" for 7 series and older, "),e("code",[t._v("05")]),t._v(" for 8 series and newer")])]),t._v(" "),e("tr",[e("td",{staticStyle:{"text-align":"left"}},[t._v("Byte 2")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("Laptop with Lid")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[e("code",[t._v("01")]),t._v(" for true, "),e("code",[t._v("00")]),t._v(" otherwise")])]),t._v(" "),e("tr",[e("td",{staticStyle:{"text-align":"left"}},[t._v("Byte 3")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("Composite")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[e("code",[t._v("01")]),t._v(" for S-Video, "),e("code",[t._v("00")]),t._v(" otherwise")])]),t._v(" "),e("tr",[e("td",{staticStyle:{"text-align":"left"}},[t._v("Byte 4")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("Backlight")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[e("code",[t._v("01")]),t._v(" for Tesla V1 with Backlight, otherwise "),e("code",[t._v("00")]),t._v(" for newer GPUs regardless of screen type")])]),t._v(" "),e("tr",[e("td",{staticStyle:{"text-align":"left"}},[t._v("Bytes 5+6")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("TVDCBMask")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[e("code",[t._v("00 00")]),t._v(", relates to DCB entry 5")])]),t._v(" "),e("tr",[e("td",{staticStyle:{"text-align":"left"}},[t._v("Bytes 7+8")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("Head0DCBMask")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[e("code",[t._v("00 00")]),t._v(", see below")])]),t._v(" "),e("tr",[e("td",{staticStyle:{"text-align":"left"}},[t._v("Bytes 9+10")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("Head1DCBMask")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[e("code",[t._v("00 00")]),t._v(", see below")])]),t._v(" "),e("tr",[e("td",{staticStyle:{"text-align":"left"}},[t._v("Bytes 11+12")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("Head2DCBMask")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[e("code",[t._v("00 00")]),t._v(", non-applicable for Fermi and older")])]),t._v(" "),e("tr",[e("td",{staticStyle:{"text-align":"left"}},[t._v("Bytes 13+14")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("Head3DCBMask")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[e("code",[t._v("00 00")]),t._v(", non-applicable for Fermi and older")])]),t._v(" "),e("tr",[e("td",{staticStyle:{"text-align":"left"}},[t._v("Byte 15")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("ScriptBasedPowerAndBacklight")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[e("code",[t._v("00")]),t._v(", only relevant for genuine MacBook Pros")])]),t._v(" "),e("tr",[e("td",{staticStyle:{"text-align":"left"}},[t._v("Byte 16")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("Unknown")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[e("code",[t._v("0F")]),t._v(" for 300 series and newer, otherwise "),e("code",[t._v("07")])])]),t._v(" "),e("tr",[e("td",{staticStyle:{"text-align":"left"}},[t._v("Byte 17")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("EDID")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[e("code",[t._v("00")])])]),t._v(" "),e("tr",[e("td",{staticStyle:{"text-align":"left"}},[t._v("Byte 18")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("Reserved")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[e("code",[t._v("00")])])]),t._v(" "),e("tr",[e("td",{staticStyle:{"text-align":"left"}},[t._v("Byte 19")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("Reserved")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[e("code",[t._v("00")])])]),t._v(" "),e("tr",[e("td",{staticStyle:{"text-align":"left"}},[t._v("Byte 20")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("Reserved")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[e("code",[t._v("00")])])])])])]),t._v(" "),e("h3",{attrs:{id:"cleaning-up"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#cleaning-up"}},[t._v("#")]),t._v(" Cleaning up")]),t._v(" "),e("p",[t._v("Now that we've gotten all our properties, we can now add em up and place them in our config.plist:")]),t._v(" "),e("div",{staticClass:"language- extra-class"},[e("pre",{pre:!0,attrs:{class:"language-text"}},[e("code",[t._v("PciRoot(0x2)/Pci(0x0,0x0)/Pci(0x0,0x0)\n\nmodel          | String | GeForce GT 220\ndevice_type    | String | NVDA,Parent\nVRAM,totalsize |  Data  | 0000004000000000\nrom-revision   | String | Dortania\nNVCAP          |  Data  | 05000000 00000300 0c000000 0000000f 00000000\n@0,compatible  | String | NVDA,NVMac\n@0,device_type | String | display\n@0,name        | String | NVDA,Display-A\n@1,compatible  | String | NVDA,NVMac\n@1,device_type | String | display\n@1,name        | String | NVDA,Display-B\n")])])]),e("p",[t._v("Open your config.plist and head to "),e("code",[t._v("DeviceProperties -> Add")]),t._v(", next create a new child with the name of your GPU's path(ie the one with gfxutil). Then, finally add the properties as children to the PciRoot. You should end up with something similar:")]),t._v(" "),e("p",[e("img",{attrs:{src:a(306),alt:""}})])])}),[],!1,null,null,null);e.default=i.exports}}]);