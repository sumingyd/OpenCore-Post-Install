# 传统的英特尔设置

涵盖了对以下GPU型号的支持。

* GMA 900 (10.4和10.5)
  * 10.6和10.7中的部分支持，但加速问题很常见
* GMA 950(10.4-10.7)
  * GMA 3150的可以被欺骗支持，然而缺少适当的加速功能
* GMA X3100(10.5-10.7)
  * 注意只有移动型号(即965 Express芯片组家族)

请注意，这个页面更像是一个信息转储，我们不会对设置进行太多细节，尽管我们计划为它扩展这个页面。信息是基于[Clover's InjectIntel](https://github.com/CloverHackyColor/CloverBootloader/blob/2961827dce9c0ab26345c00fb5a9c581f96c0d6b/rEFIt_UEFI/Platform/gma.cpp)

## 前提条件

不幸的是，对GMA的支持在PC上要复杂一些，正因为如此，我们需要强制使用32位的内核空间，因为64位的GMA驱动以奇怪的GPU损坏和睡眠问题而闻名。要做到这一点。

* 确保你所有的内核都是32位或FAT的
  * 在kext的二进制文件上运行`lipo -archs`来验证
  * 普通的kexts存放在这里[Legacy-Kexts](https://github.com/khronokernel/Legacy-Kexts)
* 确保你启动的是一个32位的内核
  * 设置 `Keenel->Scheme->KernelArch`为`i386`

现在我们可以开始设置了:

* [GMA 950设置](#gma-950-setup)
  * 支持GMA 900、950和3150
* [GMA X3100设置](#gma-x3100-setup)
  *只支持移动式GMA X3100
* [故障排除](#troubleshooting)
  * [戴尔笔记本](#dell-laptops)
  * [Kernel Panic after 30 seconds](#kernel-panic-after-30-seconds)

## GMA 950设置

*支持的操作系统：10.4-10.7

本节主要与GMA 900和950用户有关，并对GMA 3150系列提供部分支持。请注意，GMA 900只在10.4和10.5中得到适当支持。

在AppleIntelGMA950.kext的Info.plist中，支持以下设备ID：

```md
# 从OS X 10.7.0提取的数值
0x2582 - GMA 900 - Grantsdale - 945GM/GMS/940GML
0x2592 - GMA 900 - Alviso     - 945G
0x2772 - GMA 950 - Lakeport   - 915GM/GMS/910GML
0x27A2 - GMA 950 - Calistoga  - 82915G/GV/910GL
```

如果你的iGPU是来自上述家族之一，但设备ID不存在，你可以轻松地添加一个假的设备ID。

```md
# GMA 950(Calistoga) 假 ID
config.plist:
|-DeviceProperties
 |- Add
  |- PciRoot(0x0)/Pci(0x2,0x0)
   |- device-id | Data | A2270000
```

关于支持的GPU系列的完整列表，见下文：

::: details GMA设备系列

以下内容来自Clover的GMA.c:

```md
# Grantsdale
0x2582 - GMA 900 - 945GM/GMS/940GML
0x258A - GMA 900 - E7221
0x2782 - GMA 900 - 82915G

# Alviso
0x2592 - GMA 900 - 915GM/GMS/910GML
0x2792 - GMA 900 - 915GM/GMS/910GML

# Lakeport
0x2772 - GMA 950 - 915GM/GMS/910GML
0x2776 - GMA 950 - 915GM/GMS/910GML

# Calistoga
0x27A2 - GMA 950 - 82915G/GV/910GL
0x27A6 - GMA 950 - 945GM/GMS/GME, 943/940GML
0x27AE - GMA 950 - 945GSE
```

:::

### 属性注入

为了确保OpenCore的适当加速，请进入你的config.plist，然后`DeviceProperties -> Add`。创建一个名为`PciRoot(0x0)/Pci(0x2,0x0)`的新子项，我们将添加我们需要的属性：

台式机需要的属性很少，大多数时候不需要任何属性就可以启动。

* 桌面：

```
| model         | String | GMA 950  | // Mainly cosmetic
| AAPL,HasPanel | Data   | 00000000 |
```

* 笔记本:

```
| model                     | String | GMA 950  | // Mainly cosmetic
| AAPL,HasPanel             |  Data  | 01000000 |
| AAPL01,BacklightIntensity |  Data  | 3F000008 |
| AAPL01,BootDisplay        |  Data  | 01000000 |
| AAPL01,DataJustify        |  Data  | 01000000 |
| AAPL01,DualLink           |  Data  | 00       |

* 如果你的内部显示器高于1366x768，将AAPL01,DualLink设置为01。
```

关于Clover注入的内容的完整列表，请看下面：

::: details Clover的InjectIntel属性

下面的属性是Clover将为GMA 900/950系列iGPU注入的内容：

```
| built-in                  | Data | 01       |
| AAPL,HasPanel             | Data | 01000000 |
| AAPL01,BacklightIntensity | Data | 3F000008 |
| AAPL01,BootDisplay        | Data | 01000000 |
| AAPL01,DataJustify        | Data | 01000000 |
| AAPL01,Dither             | Data | 00000000 |
| AAPL01,Interlace          | Data | 00000000 |
| AAPL01,Inverter           | Data | 00000000 |
| AAPL01,InverterCurrent    | Data | 00000000 |
| AAPL01,LinkFormat         | Data | 00000000 |
| AAPL01,LinkType           | Data | 00000000 |
| AAPL01,Pipe               | Data | 01000000 |
| AAPL01,Refresh            | Data | 3B000000 |
| AAPL01,Stretch            | Data | 00000000 |
| AAPL01,T1                 | Data | 00000000 |
| AAPL01,T2                 | Data | 01000000 |
| AAPL01,T3                 | Data | C8000000 |
| AAPL01,T4                 | Data | C8010000 |
| AAPL01,T5                 | Data | 01000000 |
| AAPL01,T6                 | Data | 00000000 |
| AAPL01,T7                 | Data | 90100000 |
```

:::

对于GMA 3150用户，你也要添加这个补丁：

::: details GMA 3150 补丁

在Kernel -> Patch下，添加以下内容：

```
Comment    = GMA 3150 Cursor corruption fix
Enabled    = True
Identifier = com.apple.driver.AppleIntelIntegratedFramebuffer
Find       = 8b550883bab0000000017e36890424e832bbffff
Replace    = b800000002909090909090909090eb0400000000
MaxKernel  = 11.99.99
MinKernel  = 8.00.00
```

来源: [GMA.c](https://github.com/CloverHackyColor/CloverBootloader/blob/2961827dce9c0ab26345c00fb5a9c581f96c0d6b/rEFIt_UEFI/Platform/gma.cpp#L1735L1739)

:::

## GMA X3100 设置

* 支持的操作系统：10.5-10.7

在AppleIntelGMAX3100.kext的Info.plist中，支持以下设备ID：

```md
# 取自OS X 10.7.0的数值
0x2a02 - GMA X3100 - Crestline - GM965/GL960
```

如果你的iGPU是Crestline系列的，但是设备ID不存在，你可以很容易地添加一个假的设备ID：

```md
# GMA X3100(Crestline) 假 ID
config.plist:
|-DeviceProperties
 |- Add
  |- PciRoot(0x0)/Pci(0x2,0x0)
   |- device-id | Data | 022A0000
```

关于支持的GPU系列的完整列表，见下文：

::: details GMA设备系列

以下内容来自Clover的GMA.c:

```md
# Calistoga
0x2A02 - GMA X3100 - GM965/GL960
0x2A03 - GMA X3100 - GM965/GL960
0x2A12 - GMA X3100 - GME965/GLE960
0x2A13 - GMA X3100 - GME965/GLE960
```

:::

### 属性注入

为了确保OpenCore的适当加速，请进入你的config.plist，然后`DeviceProperties -> Add`。创建一个名为`PciRoot(0x0)/Pci(0x2,0x0)`的新子项，我们将添加我们需要的属性。

X3100需要的属性非常少，大多数时候不需要任何属性就可以启动。

```
| model                     | String | GMA X3100 | // Mainly cosmetic
| AAPL,HasPanel             |  Data  | 01000000  |
| AAPL,SelfRefreshSupported |  Data  | 01000000  | // Optional
| AAPL,aux-power-connected  |  Data  | 01000000  | // Optional
| AAPL,backlight-control    |  Data  | 01000008  | // Optional
| AAPL01,BacklightIntensity |  Data  | 38000008  |
| AAPL01,BootDisplay        |  Data  | 01000000  |
| AAPL01,DataJustify        |  Data  | 01000000  |
| AAPL01,DualLink           |  Data  | 00        |

* 如果你的内部显示器高于1366x768，将AAPL01,DualLink设置为01。
```

关于Clover注入的内容的完整列表，请看下面:

::: details Clover的InjectIntel属性

下面的属性是Clover将为GMA 900/950系列iGPU注入的内容：

```
| built-in                       | Data | 01       |
| AAPL,HasPanel                  | Data | 01000000 |
| AAPL,SelfRefreshSupported      | Data | 01000000 |
| AAPL,aux-power-connected       | Data | 01000000 |
| AAPL,backlight-control         | Data | 01000008 |
| AAPL00,blackscreen-preferences | Data | 00000008 |
| AAPL01,BootDisplay             | Data | 01000000 |
| AAPL01,BacklightIntensity      | Data | 38000008 |
| AAPL01,blackscreen-preferences | Data | 00000000 |
| AAPL01,DataJustify             | Data | 01000000 |
| AAPL01,Dither                  | Data | 00000000 |
| AAPL01,Interlace               | Data | 00000000 |
| AAPL01,Inverter                | Data | 00000000 |
| AAPL01,InverterCurrent         | Data | 08520000 |
| AAPL01,LinkFormat              | Data | 00000000 |
| AAPL01,LinkType                | Data | 00000000 |
| AAPL01,Pipe                    | Data | 01000000 |
| AAPL01,Refresh                 | Data | 3D000000 |
| AAPL01,Stretch                 | Data | 00000000 |
| AAPL01,T1                      | Data | 00000000 |
| AAPL01,T2                      | Data | 01000000 |
| AAPL01,T3                      | Data | C8000000 |
| AAPL01,T4                      | Data | C8010000 |
| AAPL01,T5                      | Data | 01000000 |
| AAPL01,T6                      | Data | 00000000 |
| AAPL01,T7                      | Data | 90100000 |
```

:::

## 故障排除

### 戴尔笔记本电脑

使用GMA iGPU的戴尔笔记本电脑的一个恼人的问题是，它们在启动时通常会出现黑屏。这是由于ACPI中的`DVI`设备造成的，所以我们需要给它打上补丁，以便在macOS中顺利运行。

例如SSDT：

```c
DefinitionBlock ("", "SSDT", 2, "DRTNIA", "SsdtDvi", 0x00001000)
{
    External (_SB_.PCI0.SBRG.GFX0.DVI_, DeviceObj)

    Scope (\_SB.PCI0.SBRG.GFX0.DVI)
    {
        Method (_STA, 0, NotSerialized)  // _STA: Status
        {
            If (_OSI ("Darwin"))
            {
                Return (0)
            }
            Else
            {
                Return (0x0F)
            }
        }
    }
```

### 30秒后内核崩溃

10.6及以前版本的另一个奇怪的问题是，PciRoot的_UID值**必须**为零，否则会发生内核崩溃。坏UID条目的例子：

```c
Device (PCI0)  {
 Name (_HID, EisaId ("PNP0A08")) // Use PNP0A08 to find your PciRoot
 Name (_CID, EisaId ("PNP0A03"))
 Name (_ADR, One)
 Name (_UID, Zero)               // Needs to be patched to Zero
```
