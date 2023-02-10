# 修复USB电源

有了Skylake和更新的SMBIOS，苹果不再通过IOUSBHostFamily提供USB电源设置，这意味着我们需要采用与真正的mac相同的方法，为macOS提供一个USBX设备。这将设置所有USB端口的唤醒和睡眠功率值，并可以帮助修复许多高功率设备:

* 麦克风
* DACs
* 网络摄像头
* 蓝牙适配器

以下SMBIOS需要USBX:

* iMac17,x 及更新版本
* MacPro7,1 及更新版本
* iMacPro1,1 及更新版本
* Macmini8,1 及更新版本
* MacBook9,x  及更新版本
* MacBookAir8,x  及更新版本
* MacBookPro13,x 及更新版本

幸运的是，你可以使用预编译的USBX文件: [SSDT-USBX](https://github.com/dortania/OpenCore-Post-Install/blob/master/extra-files/SSDT-USBX.aml)
