# 苹果安全引导

* Note: DmgLoading, SecureBootModel 和 ApECID 需要 [OpenCore 0.6.1](https://github.com/acidanthera/OpenCorePkg/releases)或更新的
* 注2:macOS Big Sur需要OpenCore 0.6.3+才能获得正确的Apple安全引导支持

## 什么是苹果安全引导

* 信息来自[vit9696的线程](https://applelife.ru/posts/905541)， [Apple的T2文档](https://www.apple.com/euro/macbook-pro-13/docs/a/Apple_T2_Security_Chip_Overview.pdf)和[Osy的安全引导页面](https://osy.gitbook.io/hac-mini-guide/details/secure-boot)

为了更好地理解苹果的安全启动，让我们看看Macs和OpenCore中启动过程是如何在安全性方面工作的:

![](../../images/post-install/security-md/extension.png)

正如我们所看到的，在Apple的Secure Boot中包含了几个信任层:

* OpenCore将验证boot.efi清单(例如boot.efi.j137ap.im4m)，以确保boot.efi是由Apple签署的，并且可以用于此安全引导模型。
  * 对于非零的ApECID, OpenCore将额外验证ECID值，该值写入boot.efi清单(例如，boot.efi.j137ap. xxxxxxxx.im4m)，以确保来自具有相同安全引导模型的不同机器的受损硬盘驱动器不能在您的计算机中使用。

* boot.Efi将验证内核缓存，以确保它没有被篡改
* apfs.kext和AppleImage4确保您的系统卷的快照没有被篡改(仅适用于Big Sur+)

并不是所有的这些验证都是必需的，但是对于那些希望获得最大安全性的人来说，它们都是可能的。目前关于基于固件的安全启动的信息还没有涵盖，但是所有的苹果安全启动选项将在下面详细介绍。

## DmgLoading

这是一个非常简单的设置，但是对于苹果安全启动来说很重要。此设置允许您使用OpenCore中的dmg设置加载策略。默认情况下，我们建议使用`Signed`，但为了最好的安全性，`Disabled`可能是首选。

可能的选项 `Misc -> Security -> DmgLoading`:

| Value | Comment |
| :--- | :--- |
| Any      | 允许在OpenCore中加载所有dmg，但是如果启用了Apple安全引导，此选项将导致引导失败 |
| Signed   | 只允许苹果签名的dmg，如macOS安装程序加载 |
| Disabled | 禁用所有外部DMG加载，但是内部恢复仍然允许使用此选项 |

## SecureBootModel

SecureBootModel用于设置苹果安全引导硬件模型和策略，允许我们启用苹果的安全引导与任何SMBIOS，即使原来的SMBIOS不支持它(即。2017年之前的SMBIOS中没有T2)。启用SecureBootModel相当于[“中等安全性”](https://support.apple.com/HT208330)，完全安全性请参见[ApECID](#ApECID)

目前，`Misc -> Security -> SecureBootModel`支持以下选项:

| Value     | SMBIOS                                  | Minimum macOS Version |
| :---      | :---                                    | :---                  |
| Disabled  | 没有型号，安全引导将被禁用。               | N/A                   |
| Default   | Currently set to x86legacy              | 11.0.1 (20B29)        |
| j137      | iMacPro1,1 (December 2017)              | 10.13.2 (17C2111)     |
| j680      | MacBookPro15,1 (July 2018)              | 10.13.6 (17G2112)     |
| j132      | MacBookPro15,2 (July 2018)              | 10.13.6 (17G2112)     |
| j174      | Macmini8,1 (October 2018)               | 10.14 (18A2063)       |
| j140k     | MacBookAir8,1 (October 2018)            | 10.14.1 (18B2084)     |
| j780      | MacBookPro15,3 (May 2019)               | 10.14.5 (18F132)      |
| j213      | MacBookPro15,4 (July 2019)              | 10.14.5 (18F2058)     |
| j140a     | MacBookAir8,2 (July 2019)               | 10.14.5 (18F2058)     |
| j152f     | MacBookPro16,1 (November 2019)          | 10.15.1 (19B2093)     |
| j160      | MacPro7,1 (December 2019)               | 10.15.1 (19B88)       |
| j230k     | MacBookAir9,1 (March 2020)              | 10.15.3 (19D2064)     |
| j214k     | MacBookPro16,2 (May 2020)               | 10.15.4 (19E2269)     |
| j223      | MacBookPro16,3 (May 2020)               | 10.15.4 (19E2265)     |
| j215      | MacBookPro16,4 (June 2020)              | 10.15.5 (19F96)       |
| j185      | iMac20,1 (August 2020)                  | 10.15.6 (19G2005)     |
| j185f     | iMac20,2 (August 2020)                  | 10.15.6 (19G2005)     |
| x86legacy | Non-T2 Macs in 11.0(Recommended for VMs)| 11.0.1 (20B29)        |

### SecureBootModel的特别注意事项

* 如果你计划在ApECID中使用`Default`值以获得完全的安全性，我们不建议使用它，我们建议设置一个适当的值(即最接近你的SMBIOS或你计划启动的macOS版本)，因为`Default`值可能在未来会更新。
  * 此外，`Default`设置为`x86legacy`，这将破坏从High Sierra到Catalina的引导。
  * 没有T2的普通Mac型号不需要`x86legacy`，支持上述任何值。
* 缓存的驱动程序列表可能不同，导致需要更改已添加或已强制的内核驱动程序列表。
  * 即;在这种情况下，IO80211Family不能被注入，因为它已经存在于内核缓存中
* 无法使用无签名和几个有签名的内核驱动程序
  * 这包括Nvidia 10.13中的Web驱动程序
* 在像macOS 11这样具有密封功能的操作系统上，系统卷的改变可能会导致操作系统无法启动。
  * 如果您计划禁用macOS的APFS快照，请记得禁用SecureBootModel
* 某些引导错误更有可能在启用安全引导时被触发，而这些错误以前是不需要的
  * 通常在某些APTIO IV系统中，它们最初可能不需要IgnoreInvalidFlexRatio和HashServices，但安全引导需要。
* 在旧的cpu上(例如。在Sandy Bridge之前)启用Apple Secure Boot可能会导致最多1秒的加载速度稍慢
* 在苹果安全引导登陆之前发布的操作系统(例如:macOS 10.12或更早版本)将仍然引导，直到启用UEFI安全引导。这是真的，
  * 这是由于苹果的安全引导假设它们是不兼容的，将由固件处理，就像微软的Windows一样
* 虚拟机需要使用`x86legacy`来获得安全引导支持
  * 注意使用任何其他型号都需要启用`forceecurebootscheme`

::: details 故障排除

由于苹果端存在一个恼人的bug，某些系统可能丢失了硬盘上的安全引导文件。因此，你可能会遇到如下问题:

```
OCB: LoadImage failed - Security Violation
```

要解决此问题，请在macOS中运行以下命令:

```bash
# 首先，找到Preboot卷
diskutil list

# 从下面的列表中，我们可以看到Preboot卷是disk5s2
/dev/disk5 (synthesized):
   #:                       TYPE NAME                    SIZE       IDENTIFIER
   0:      APFS Container Scheme -                      +255.7 GB   disk5
                                 Physical Store disk4s2
   1:                APFS Volume ⁨Big Sur HD - Data⁩       122.5 GB   disk5s1
   2:                APFS Volume ⁨Preboot⁩                 309.4 MB   disk5s2
   3:                APFS Volume ⁨Recovery⁩                887.8 MB   disk5s3
   4:                APFS Volume ⁨VM⁩                      1.1 MB     disk5s4
   5:                APFS Volume ⁨Big Sur HD⁩              16.2 GB    disk5s5
   6:              APFS Snapshot ⁨com.apple.os.update-...⁩ 16.2 GB    disk5s5s
# 现在挂载Preboot卷
diskutil mount disk5s2

# CD到Preboot卷
# 注意实际卷在macOS的/System/Volumes/Preboot目录下
# 但是在Recovery中，它只是在/Volumes/Preboot下
cd /System/Volumes/Preboot

# 获取UUID
ls
 46923F6E-968E-46E9-AC6D-9E6141DF52FD
 CD844C38-1A25-48D5-9388-5D62AA46CFB8

# 如果多个出现(例如。双重引导macOS的多个版本),你应该这么做：
# 需要确定哪些UUID是正确的。
# 最简单的方法是打印.disk_label.contentDetails的值
# 每个卷的
cat ./46923F6E-968E-46E9-AC6D-9E6141DF52FD/System/Library/CoreServices/.disk_label.contentDetails
 Big Sur HD%

cat ./CD844C38-1A25-48D5-9388-5D62AA46CFB8/System/Library/CoreServices/.disk_label.contentDetails
 Catalina HD%

# 接下来让我们复制安全引导文件，恢复将需要不同的命令

# macOS内部的示例命令
# 用UUID值替换CD844C38-1A25-48D5-9388-5D62AA46CFB8
cd ~
sudo cp -a /usr/standalone/i386/. /System/Volumes/Preboot/CD844C38-1A25-48D5-9388-5D62AA46CFB8/System/Library/CoreServices

# 恢复命令示例
# 将Macintosh\ HD和CD844C38-1A25-48D5-9388-5D62AA46CFB8更换为
# 系统卷的名称和Preboot的UUID
cp -a /Volumes/Macintosh\ HD/usr/standalone/i386/. /Volumes/Preboot/CD844C38-1A25-48D5-9388-5D62AA46CFB8/System/Library/CoreServices
```

现在您可以启用SecureBootModel并重新启动，而不出问题!由于我们没有编辑系统卷本身，我们不需要担心禁用SIP或破坏macOS快照。

:::

## ApECID

ApECID被用作Apple Enclave标识符，这意味着它允许我们使用个性化的Apple安全引导标识符，并根据Apple的安全引导页面(与SecureBootModel配对时)实现[“完全安全”](https://support.apple.com/HT208330)。

要生成您自己的ApECID值，您需要某种形式的加密安全随机数生成器，它将输出一个64位整数。下面我们提供了一个可以运行的示例，如果[Python 3](https://www.python.org/downloads/)安装在您的机器上:

```py
python3 -c 'import secrets; print(secrets.randbits(64))'
```

有了这个唯一的64位整数，现在可以在config.plist中的Misc -> ApECID下输入它

然而，在设置ApECID之前，有几件事我们需要注意:

* 如果将ApECID设置为非零值，则需要在安装时进行网络连接以进行验证
* SecureBootModel应该有一个已定义的值而不是`Default`，以避免在以后的OpenCore版本中更改值时出现问题。
* 预先存在的安装需要对卷进行个性化设置，为此，您需要首先重新启动恢复并运行以下命令(将`Macintosh HD`替换为系统的卷名):

```sh
# 设置ApECID值后，执行此命令
# 在恢复过程中，您还需要一个活跃的网络连接来运行此命令
bless --folder "/Volumes/Macintosh HD/System/Library/CoreServices" --bootefi --personalize
```

重新安装macOS 10.15或更老版本时需要注意的是，您可能会收到“无法验证macOS”错误消息。要解决这个问题，在开始安装之前，您需要在macOS恢复终端中输入以下命令，为macOS个性化分配一个2 mb的专用RAM磁盘:

```sh
disk=$(hdiutil attach -nomount ram://4096)
diskutil erasevolume HFS+ SecureBoot $disk
diskutil unmount $disk
mkdir /var/tmp/OSPersonalizationTemp
diskutil mount -mountpoint /var/tmp/OSPersonalizationTemp $disk
```
