# 系统准备

Table of Contents:

[[toc]]

所以在我们进行USB映射之前，我们需要设置一些事情:

* [USBInjectAll](https://github.com/Sniki/OS-X-USB-Inject-All/releases) 添加到在 EFI/OC/Kexts 和 config.plist -> Kernel -> Add
  * 我们需要这个kext来确保任何没有在ACPI中定义的端口仍然会在macOS中显示，请注意，在Skylake和更新的系统中*不需要*这一点，因为USB端口是在ACPI中定义的。
    * 因为oem并不总是包括端口，即使在较新的系统上，我们建议所有英特尔用户使用USBInjectAll，直到正确映射。
  * 注意，这个**不能在AMD**上工作
* config.plist -> Kernel -> Quirks -> XhciPortLimit -> True
  * 所以我们可以暂时绕过15个端口的限制来映射我们的端口
* config.plist -> ACPI -> Patch -> EHCI and XHCI ACPI renames

我们需要这些ACPI重命名的原因是由于与苹果自己的USB映射冲突，有趣的是，即使苹果也有USB映射!你实际上可以在Catalina的IOUSBHostFamily kext -> PlugIns -> AppleUSBHostPlatformProperties.kext中找到苹果的USB地图，虽然较新的mac实际上与他们的ACPI表端口地图代替。

不需要ACPI重命名的smbios:

* iMac18,x 及更新版本
* MacPro7,1 及更新版本
* Macmini8,1 及更新版本
* MacBook9,x  及更新版本
* MacBookAir8,x  及更新版本
* MacBookPro13,x 及更新版本

因此，对于较旧的SMBIOSes(上面没有列出)，我们需要确保它们的端口映射不连接，而我们尝试自己的USB映射。还有一些端口可能会消失，**在**应用这些补丁之前，请检查您的ACPI表中是否有这些端口，因为我们不想给错误的设备打补丁。如果你发现你的USB控制器需要重命名，在重命名之前写下它们的原始名称，这将使USB映射过程更容易:

* **XHC1 to SHCI**: Skylake和较旧的SMBIOS需要

| Key | Type | Value |
| :--- | :--- | :--- |
| Comment | String | XHC1 to SHCI |
| Count | Number | <0> |
| Enabled | Boolean | YES |
| Find | Data | <58484331> |
| Limit | Number | <0> |
| Replace | Data | <53484349> |
| Skip | Number | <0> |
| TableLength | Number | <0> |
| TableSignature | Data | <> |

* **EHC1 to EH01**: Broadwell和更老版本SMBIOS需要

| Key | Type | Value |
| :--- | :--- | :--- |
| Comment | String | EHC1 to EH01 |
| Count | Number | <0> |
| Enabled | Boolean | YES |
| Find | Data | <45484331> |
| Limit | Number | <0> |
| Replace | Data | <45483031> |
| Skip | Number | <0> |
| TableLength | Number | <0> |
| TableSignature | Data | <> |

* **EHC2 to EH02**: Broadwell和更老版本SMBIOS需要

| Key | Type | Value |
| :--- | :--- | :--- |
| Comment | String | EHC2 to EH02 |
| Count | Number | <0> |
| Enabled | Boolean | YES |
| Find | Data | <45484332> |
| Limit | Number | <0> |
| Replace | Data | <45483032> |
| Skip | Number | <0> |
| TableLength | Number | <0> |
| TableSignature | Data | <> |

## 检查你需要的重命名

因此，通过重命名，很容易找到你使用的SMBIOS(可以在你的config.plist中找到`PlatformInfo -> Generic -> SystemProductName`)，并匹配确定你是否需要USB映射:

SMBIOS 只需要 XHC1 重命名:

* iMacPro1,1
* iMac17,x 和更旧的
* MacBookAir7,x

SMBIOS 需要 XHC1 and EHC1 重命名:

* MacPro6,1
* Macmini7,1
* MacBook8,x
* MacBookAir6,x
* MacBookPro12,x

SMBIOS 需要 XHC1, EHC1 和 EHC2 重命名:

* iMac16,x 和更旧的
* MacPro5,1 和更旧的
* Macmini6,x 和更旧的
* MacBookAir5,x  和更旧的
* MacBookPro11,x 和更旧的

现在我们知道了SMBIOS需要什么重命名，接下来可以检查USB控制器的名称。

### 查看IOService

让我们以XHC1为例，执行以下命令:

```sh
ioreg -l -p IOService -w0 | grep -i XHC1
```

如果你看到这个，你需要重命名: |  如果你看到这个，你不需要重命名:
:-------------------------:|:-------------------------:
![](../images/system-preperation-md/ioreg-name.png)  |  ![](../images/system-preperation-md/no-rename-needed.png)

对所有其他相关的冲突设备(例如EHC1, EHC2)重复此步骤，如表中列出的您的型号。

```sh
ioreg -l -p IOService -w0 | grep -i EHC1
ioreg -l -p IOService -w0 | grep -i EHC2
```

**如果没有返回任何内容(比如正确的图像)**，则不需要任何重命名。

**如果返回了3个条目中的一个(如左图所示)**，则需要为返回的内容重命名。

如果你是后者，你现在想要添加所需的ACPI重命名到你的 config.plist -> ACPI -> Patch,您可以在这里找到一个预先制作的文件(注意，您需要启用您需要的那些):

* **[usb-rename.plist](https://github.com/dortania/OpenCore-Post-Install/blob/master/extra-files/usb-rename.plist)**
  * 只需复制所需的补丁到您的config.plist

# 分型方法

但现在我们必须分成两部分，这取决于你有什么硬件:

* [Intel USB 映射](../usb/intel-mapping/intel.md)
  * 一个更自动化的过程，不过只适用于英特尔
* [手动 USB 映射](../usb/manual/manual.md)
  * 更多的一步一步的过程，这是正确映射AMD和第三方USB控制器的唯一方法。
