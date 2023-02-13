# 扫描策略

这个选项可以防止从不可信的来源扫描和启动。设置为`0`将允许所有源启动，但计算特定的ScanPolicy值将允许你拥有更大范围的灵活性和安全性。

要计算ScanPolicy的值，只需将所有十六进制值相加(使用十六进制计算器，可以使用`⌘+3`从macOS内置计算器应用中访问)。把这些加起来之后，把这个十六进制值加到ScanPolicy(首先需要把它转换成小数，Xcode会在粘贴时自动转换它)。

`0x00000001 (bit 0)` — OC\_SCAN\_FILE\_SYSTEM\_LOCK

* 将扫描限制为仅限该策略中定义的已知文件系统。文件系统驱动程序可能不知道这个策略，为了避免装入不需要的文件系统，最好不要装入它的驱动程序。该位不影响dmg的挂载，dmg挂载可能包含任何文件系统。已知的文件系统以 OC_SCAN\_ALLOW\_FS_ 作为前缀。

`0x00000002 (bit 1)` — OC\_SCAN\_DEVICE\_LOCK

* 将扫描限制为该策略中定义的已知设备类型。这并不总是能够检测到协议隧道，因此请注意，在某些系统上，例如USB hdd可能被识别为SATA。这种情况必须报告。已知的设备类型以OC_SCAN\_ALLOW\_DEVICE_作为前缀。

`0x00000100 (bit 8)` — OC\_SCAN\_ALLOW\_FS\_APFS

* 允许扫描APFS文件系统。

`0x00000200 (bit 9)` — OC\_SCAN\_ALLOW\_FS\_HFS

* 允许扫描HFS文件系统。

`0x00000400 (bit 10)` — OC\_SCAN\_ALLOW\_FS\_ESP

* 允许扫描EFI系统分区文件系统。

`0x00010000 (bit 16)` — OC\_SCAN\_ALLOW\_DEVICE\_SATA

* 允许扫描SATA设备。

`0x00020000 (bit 17)` — OC\_SCAN\_ALLOW\_DEVICE\_SASEX

* 允许扫描SAS和Mac NVMe设备。

`0x00040000 (bit 18)` — OC\_SCAN\_ALLOW\_DEVICE\_SCSI

* 允许扫描SCSI设备。

`0x00080000 (bit 19)` — OC\_SCAN\_ALLOW\_DEVICE\_NVME

* 允许扫描NVMe设备。

`0x00100000 (bit 20)` — OC\_SCAN\_ALLOW\_DEVICE\_ATAPI

* 允许扫描CD/DVD设备。

`0x00200000 (bit 21)` — OC\_SCAN\_ALLOW\_DEVICE\_USB

* 允许扫描USB设备。

`0x00400000 (bit 22)` - OC\_SCAN\_ALLOW\_DEVICE\_FIREWIRE

* 允许扫描FireWire设备。

`0x00800000 (bit 23)` — OC\_SCAN\_ALLOW\_DEVICE\_SDCARD

* 允许扫描读卡器设备。

`0x01000000 (bit 24)` — OC\_SCAN\_ALLOW\_DEVICE\_PCI

* 允许扫描设备直接连接到PCI总线(例如VIRTIO)。

默认情况下，ScanPolicy的值是`0x10F0103`(17,760,515)，是以下内容的组合:

* OC\_SCAN\_FILE\_SYSTEM\_LOCK
* OC\_SCAN\_DEVICE\_LOCK
* OC\_SCAN\_ALLOW\_FS\_APFS
* OC\_SCAN\_ALLOW\_DEVICE\_SATA
* OC\_SCAN\_ALLOW\_DEVICE\_SASEX
* OC\_SCAN\_ALLOW\_DEVICE\_SCSI
* OC\_SCAN\_ALLOW\_DEVICE\_NVME
* OC\_SCAN\_ALLOW\_DEVICE\_PCI

假设在这个例子中，你要加上 OC\_SCAN\_ALLOW\_DEVICE\_USB:

`0x00200000` + `0x10F0103` = `0x12F0103`

把它转换成小数 `19,857,667`
