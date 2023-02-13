# 修复MacPro7,1内存错误

在macOS Catalina和更新版本上，MacPro7,1 SMBIOS的用户在每次引导时都会遇到以下错误:

| 通知错误 | 关于此Mac错误 |
| :--- | :--- |
| <img width="1362" src=../images/post-install/memory-md/memory-error-notification.png>  | ![](../images/post-install/memory-md/memory-error-aboutthismac.png) |

这个错误的确切原因有点未知，但是解决这个错误的方法是可行的。最常见的消除错误的方法是使用[RestrictEvents](https://github.com/acidanthera/RestrictEvents/releases)，我们强烈建议所有用户使用这个kext。

对于那些希望尝试传统映射方式的人，请参阅下面的指南。注意，这需要您手动映射所有内存，因此这将是一个耗时的过程。

## 映射我们的内存

首先，我们要获取以下文件:

* [CustomMemory.plist](https://github.com/dortania/OpenCore-Post-Install/blob/master/extra-files/CustomMemory.plist.zip)
  * 在OpenCore使用CustomMemory的示例设置
* [dmidecode](https://github.com/acidanthera/dmidecode/releases)
  * 在OpenCore使用CustomMemory的示例设置

这是一个已经为你设置了属性的预制文件，一旦你打开它，你应该看到以下内容:

![](../images/post-install/memory-md/CustomMemory-open.png)

从这里我们可以看到许多属性，让我们尝试将其分解:

* [DataWidth](#datawidth)
* [ErrorCorrection](#errorcorrection)
* [FormFactor](#formfactor)
* [MaxCapacity](#maxcapacity)
* [TotalWidth](#totalwidth)
* [Type](#type)
* [TypeDetail](#typedetail)
* [Devices](#devices)
  * [AssetTag](#assettag)
  * [BankLocator](#banklocator)
  * [DeviceLocator](#devicelocator)
  * [Manufacturer](#manufacturer)
  * [PartNumber](#partnumber)
  * [SerialNumber](#serialnumber)
  * [Size](#size)
  * [Speed](#speed)
* [Cleaning up](#cleaning-up)

### DataWidth

指定内存的数据宽度，以位为单位。数据宽度为0，总宽度为8，表示设备仅用于提供8个纠错位。

要确定数据宽度，运行以下命令:

```sh
path/to/dmidecode -t memory | grep "Data Width:"
# 示例输出
 Data Width: 64 bits
 Data Width: Unknown
 Data Width: 64 bits
 Data Width: Unknown
 Data Width: 64 bits
 Data Width: Unknown
 Data Width: 64 bits
 Data Width: Unknown
# 最终值
DataWidth = 64
```

### ErrorCorrection

指定ECC支持:

```
1 — Other
2 — Unknown
3 — None
4 — Parity
5 — Single-bit ECC
6 — Multi-bit ECC
7 — CRC
```

运行下面的命令来确定错误修正:

```sh
path/to/dmidecode -t memory | grep "Error Correction Type:"
# 示例输出
 Error Correction Type: None
# 最终值
ErrorCorrection = 3
```

### FormFactor

指定内存形式

```
1  — Other
2  — Unknown
9  — DIMM
13 — SODIMM
15 — FB-DIMM
```

运行如下命令来确定FormFactor:

```sh
path/to/dmidecode -t memory | grep "Form Factor:"
# 示例输出
 Form Factor: DIMM
 Form Factor: DIMM
 Form Factor: DIMM
 Form Factor: DIMM
 Form Factor: DIMM
 Form Factor: DIMM
 Form Factor: DIMM
 Form Factor: DIMM
# 最终值
FormFactor = 9
```

### MaxCapacity

指定系统中支持的最大内存

Type: Bytes

```
8GB   - 8589934592
16GB  - 17179869184
32GB  - 34359738368
64GB  - 68719476736
128GB - 137438953472
256GB - 274877906944
```

### TotalWidth

指定内存的总宽度(以位为单位)，包括任何检查或纠错位。如果没有纠错位，该值应该等于数据宽度。以上翻译结果来自有道神经网络翻译（YNMT）· 通用领域

要确定TotalWidth，运行以下命令:

```sh
path/to/dmidecode -t memory | grep "Total Width:"
# 示例输出
 Total Width: 72 bits
 Total Width: Unknown
 Total Width: 72 bits
 Total Width: Unknown
 Total Width: 72 bits
 Total Width: Unknown
 Total Width: 72 bits
 Total Width: Unknown
# 最终值
TotalWidth = 72
```

### Type

指定内存类型

```
1  — Other
2  — Unknown
15 — SDRAM
18 — DDR
19 — DDR2
20 — DDR2 FB-DIMM
24 — DDR3
26 — DDR4
27 — LPDDR
28 — LPDDR2
29 — LPDDR3
30 — LPDDR4
```

要确定Type，执行以下命令:

```sh
path/to/dmidecode -t memory | grep "Type:"
# 示例输出
 Type: DDR4
 Type: Unknown
 Type: DDR4
 Type: Unknown
 Type: DDR4
 Type: Unknown
 Type: DDR4
 Type: Unknown
# 最终值
Type = 26
```

### TypeDetail

指定其他内存类型信息

```
Bit 0 — Reserved, set to 0
Bit 1 — Other
Bit 2 — Unknown
Bit 7 — Synchronous
Bit 13 — Registered (buffered)
Bit 14 — Unbuffered (unregistered)
````

把所有适用的组合起来，例如:

```
Bit 13 — Registered (buffered)
Bit 14 — Unbuffered (unregistered)
-----------------------------------
27 = TypeDetail
```

要确定TypeDetail，运行以下命令:

```sh
path/to/dmidecode -t memory | grep "Type Detail:"
# 示例输出
 Type Detail: Synchronous
 Type Detail: Synchronous
 Type Detail: Synchronous
 Type Detail: Synchronous
 Type Detail: Synchronous
 Type Detail: Synchronous
 Type Detail: Synchronous
 Type Detail: Synchronous
# 最终值
TypeDetail = 7
```

### Devices

存储设备的数组，我们在这里施展魔法来修复错误。在我提供的示例CustomMemory.plist中，我们在这里列出了12个插槽。然后，在macOS中打开System Profiler并查看Memory选项卡:

![](../images/post-install/memory-md/system-profiler.png)

在这里，我们可以看到哪些槽被内存填充了，哪些是空的。对于填充的插槽，只需阅读下面关于如何获取信息的内容。然而，对于空槽，你需要添加一些空白信息，以为macOS已经填充了设备。确保到最后，总共有12个插槽装满了设备。

填充槽和假槽的例子:

![](../images/post-install/memory-md/memory-example.png)

我们建议将Size和Speed都设置为1，以确保从内存中提取的应用程序不会混淆，因为您拥有的内存超过了应该使用的内存。

接下来让我们分解属性:

* [AssetTag](#assettag)
* [BankLocator](#banklocator)
* [DeviceLocator](#devicelocator)
* [Manufacturer](#manufacturer)
* [PartNumber](#partnumber)
* [SerialNumber](#serialnumber)
* [Size](#size)
* [Speed](#speed)

#### AssetTag

要确定AssetTag，运行以下命令:

```sh
path/to/dmidecode -t memory | grep "Asset Tag:"
#示例输出

# 最终值
```

* 如果dmidecode打印出`Not Specified`，你可以将这个条目留空

#### BankLocator

To determine BankLocator, run the following:

```sh
path/to/dmidecode -t memory | grep "Bank Locator:"
#示例输出

# 最终值
```

* 如果dmidecode打印出`Not Specified`，你可以将这个条目留空

#### DeviceLocator

要确定DeviceLocator，运行以下命令:

```sh
path/to/dmidecode -t memory | grep "Locator:"
#示例输出
 Locator: DIMM_A1
 Locator: DIMM_A2
 Locator: DIMM_B1
 Locator: DIMM_B2
 Locator: DIMM_C1
 Locator: DIMM_C2
 Locator: DIMM_D1
 Locator: DIMM_D2
# 最终值
Entry 1:  DIMM_A1
Entry 2:  DIMM_A2
Entry 3:  DIMM_B1
Entry 4:  DIMM_B2
Entry 5:  DIMM_C1
Entry 6:  DIMM_C2
Entry 7:  DIMM_D1
Entry 8:  DIMM_D2
Entry 9:  DIMM_EMPTY
Entry 10: DIMM_EMPTY
Entry 11: DIMM_EMPTY
Entry 12: DIMM_EMPTY
```

#### Manufacturer

要确定Manufacturer，运行以下命令:

```sh
path/to/dmidecode -t memory | grep "Manufacturer:"
#示例输出

# 最终值
```

#### PartNumber

要确定PartNumber，执行以下命令:

```sh
path/to/dmidecode -t memory | grep "Part Number:"
#示例输出
 Part Number: KHX2666C16/8G
 Part Number: NO DIMM
 Part Number: KHX2666C16/8G
 Part Number: NO DIMM
 Part Number: KHX2666C16/8G
 Part Number: NO DIMM
 Part Number: KHX2666C15D4/8G
 Part Number: NO DIMM
# 最终值
Entry 1:  KHX2666C16/8G
Entry 2:  EmptyDIMM
Entry 3:  KHX2666C16/8G
Entry 4:  EmptyDIMM
Entry 5:  KHX2666C16/8G
Entry 6:  EmptyDIMM
Entry 7:  KHX2666C15D4/8G
Entry 8:  EmptyDIMM
Entry 9:  EmptyDIMM
Entry 10: EmptyDIMM
Entry 11: EmptyDIMM
Entry 12: EmptyDIMM
```

#### SerialNumber

要确定SerialNumber，运行如下命令:

```sh
path/to/dmidecode -t memory | grep "Serial Number:"
#示例输出
 Serial Number: 0F095257
 Serial Number: NO DIMM
 Serial Number: 0C099A57
 Serial Number: NO DIMM
 Serial Number: 752EDED8
 Serial Number: NO DIMM
 Serial Number: A2032E84
 Serial Number: NO DIMM
# 最终值
Entry 1:  0F095257
Entry 2:  EmptyDIMM
Entry 3:  0C099A57
Entry 4:  EmptyDIMM
Entry 5:  752EDED8
Entry 6:  EmptyDIMM
Entry 7:  A2032E84
Entry 8:  EmptyDIMM
Entry 9:  EmptyDIMM
Entry 10: EmptyDIMM
Entry 11: EmptyDIMM
Entry 12: EmptyDIMM
```

#### Size

单个内存棒的大小(以MB为单位)

```
1GB  - 1024
2GB  - 2048
4GB  - 4096
8GB  - 8192
16GB - 16384
32GB - 32768
64GB - 65536
12GB - 131072
```

要确定Size，运行以下命令:

```sh
path/to/dmidecode -t memory | grep "Size:"
#示例输出
 Size: 8 GB
 Size: No Module Installed
 Size: 8 GB
 Size: No Module Installed
 Size: 8 GB
 Size: No Module Installed
 Size: 8 GB
 Size: No Module Installed
# 最终值
Entry 1:  8192
Entry 2:  1
Entry 3:  8192
Entry 4:  1
Entry 5:  8192
Entry 6:  1
Entry 7:  8192
Entry 8:  1
Entry 9:  1
Entry 10: 1
Entry 11: 1
Entry 12: 1
```

#### Speed

以兆赫为单位的内存速度

ex: `3000Mhz`

要确定Speed，运行以下命令:

```sh
path/to/dmidecode -t memory | grep "Speed:"
#示例输出
 Speed: 2666 MT/s
 Speed: Unknown
 Speed: 2666 MT/s
 Speed: Unknown
 Speed: 2666 MT/s
 Speed: Unknown
 Speed: 2666 MT/s
 Speed: Unknown
# 最终值
Entry 1:  2666
Entry 2:  1
Entry 3:  2666
Entry 4:  1
Entry 5:  2666
Entry 6:  1
Entry 7:  2666
Entry 8:  1
Entry 9:  1
Entry 10: 1
Entry 11: 1
Entry 12: 1
```

## 清理

现在已经构建了表，现在可以将它合并到config.plist中。

只需从CustomMemory.plist复制你的工作并粘贴到platformminfo:

![](../images/post-install/memory-md/memory-example-done.png)

复制完成后，启用`PlatformInfo -> CustomMemory`并重启。现在错误应该不会再出现了!

提醒你必须用内存**填充**所有的12个槽，否则错误将不会消失:

| 修复系统分析 | 修复关于此Mac |
| :--- | :--- |
| ![](../images/post-install/memory-md/memory-fixed-system-profiler.png) | ![](../images/post-install/memory-md/memory-fixed-aboutthismac.png) |
