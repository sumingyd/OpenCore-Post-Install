# 使用OpenCore修复iMessage和其他服务

这个页面是为那些有iMessage和其他iServices问题的人准备的，这是一个非常基本的指南，所以不会像其他一些指南那样深入讨论这些问题。本指南是对AppleLife修复服务指南的翻译和重新解释: [Как завести сервисы Apple - iMessage, FaceTime, iCloud](https://applelife.ru/posts/727913).

**你的Apple ID是使用iServices最具影响力的因素**

如果你的账户中有现有的苹果产品，比如iPhone，那么使用生成的串行集应该不会有任何问题。但是，如果你最近创建了一个账户，没有任何现有的苹果硬件或应用商店购买，你可能需要在尝试登录后打电话给苹果。

下面将创建以下项目，这是使用iServices所必需的:

* MLB
* ROM*
* SystemProductName
* SystemSerialNumber
* SystemUUID

::: tip 提示

对于ROM，我们使用网络接口的MAC地址，小写，不含`:`。

:::

**注意**:你和你自己对你的AppleID负责，仔细阅读指南，如果你搞砸了，承担全部责任。Dortania和其他指南不会对**你**做的事情负责。

## 使用GenSMBIOS

下载[GenSMBIOS](https://github.com/corpnewt/GenSMBIOS)并选择选项1下载MacSerial，选择下一个选项3生成一些新的series。我们要找的是一个没有注册购买日的有效序列号。

提示: `iMacPro1,1 10` 将输出10个串行，这将节省您生成的时间

![](../images/post-install/iservices-md/serial-list.png)

## 使用macserial

这是针对Linux用户的，也是使用GenSMBIOS的另一种选择。

为你的型号生成一个新的 Serial 和 Board Serial (MLB)。

要生成它，你需要macserial。

您可以从这里下载[OpenCorePkg的最新版本](https://github.com/acidanthera/OpenCorePkg/releases)

或者从源代码编译开发[macserial](https://github.com/acidanthera/OpenCorePkg/tree/master/Utilities/macserial)

```bash
git clone --depth 1 https://github.com/acidanthera/OpenCorePkg.git
cd ./OpenCorePkg/Utilities/macserial/
make
chmod +x ./macserial
```

在你的config.plist文件中找到你的**SystemProductName**。那是你的型号。

用config.plist中的SystemProductName替换下面的`"iMacPro1,1"`。

```bash
./macserial --num 1 --model "iMacPro1,1" 
```

示例输出:

```bash
$ ./macserial \
        --model "iMacPro1,1" 
Warning: arc4random is not available!
C02V7UYGHX87 | C02733401J9JG36A8
```

左边的值是你的**Serial number**。
右边的值是你的**Board Serial (MLB)**。

## 选择MAC地址

选择一个具有组织唯一标识符(OUI)的MAC地址，该标识符对应于真实的Apple, Inc.接口。

请看下面的列表:

[https://gitlab.com/wireshark/wireshark/-/raw/master/manuf](https://gitlab.com/wireshark/wireshark/-/raw/master/manuf)

例如:

```
00:16:CB    Apple   Apple, Inc.
```

组成最后3个八进制。

例如:

```
00:16:CB:00:11:22
```

## 获得相应的ROM值

ROM是从你的MAC地址计算出来的。

ROM是从你的MAC地址计算出来的。

例如:

**MAC:** `00:16:CB:00:11:22`

**ROM:** `0016cb001122`

## 生成UUID

在终端中输入`uuidgen`

```bash
$ uuidgen
976AA603-75FC-456B-BC6D-9011BFB4968E
```

然后简单地在config.plist中替换这些值:

|Key|Data|
|---|---|
|MLB|`C02733401J9JG36A8`|
|Mac Address|`00:16:CB:00:11:22`|
|ROM|`0016cb001122`|
|SystemProductName|`iMacPro1,1`|
|SystemSerialNumber|`C02V7UYGHX87`|
|SystemUUID|`976AA603-75FC-456B-BC6D-9011BFB4968E`|

它应该看起来像这样:

```xml
    <key>MLB</key>
    <string>C02733401J9JG36A8</string>
    <key>ROM</key>
    <data>0016cb001122</data>
    <key>SpoofVendor</key>
    <true/>
    <key>SystemProductName</key>
    <string>iMacPro1,1</string>
    <key>SystemSerialNumber</key>
    <string>C02V7UYGHX87</string>
    <key>SystemUUID</key>
    <string>976AA603-75FC-456B-BC6D-9011BFB4968E</string>
```

注意:如果你在使用App Store时有问题，你[可能需要修复En0](#fixing-en0)，这取决于你的硬件设置。

全新的Apple ID几乎肯定无法使用。在你的账户中有其他真正的设备几乎总是有效的。

如果您看到一个[支持警告，请参见下面](#customer-code-error)。

## 序列号有效期

现在将串行输入[苹果检查覆盖页面](https://checkcoverage.apple.com/)，你将得到3个答复之一:

很抱歉，我们无法查询这个序列号的覆盖范围。 |  有效的购买日期 | 购买日期未验证
:-------------------------:|:-------------------------:|:-------------------------:
![](../images/post-install/iservices-md/not-valid.png) | ![](../images/post-install/iservices-md/valid.png) |  ![](../images/post-install/iservices-md/no-purchase.png)

::: tip 提示

复制并粘贴序列号，因为无效格式的序列号也将返回“我们很抱歉，我们无法检查这个序列号的覆盖范围。”

:::

第一个是我们想要的(你也可以使用第三个，但不建议使用，因为可能会与实际的Mac发生冲突)。现在我们可以将其余的值转换为config.plist -> PlatformInfo -> Generic:

* Type = SystemProductName
* Serial = SystemSerialNumber
* Board Serial = MLB
* SmUUID = SystemUUID

::: tip 注意

虽然第一个选项适用于大多数情况，但请注意，如果你在Apple/iServices上有糟糕的记录，你可能需要一个“购买日期未验证”的选项。否则就会产生怀疑

:::

::: warning 警告

使用“购买日期未验证:”系列可能会在同一系列的另一台机器被激活时引起问题。对于初始设置，它可以帮助缓解您的帐户问题，但从长远来看，无效的串行可能是一个更安全的选择。

:::

::: tip 提示

检查太多的序列可能会导致速率受限。要绕过此限制，您可以尝试清除cookie或更改IP。

:::

## 修复 en0

首先，获取[Hackintool](https://github.com/headkaze/Hackintool)并前往系统 ->外设(信息 -> 杂项 在旧版本的Hackintool)

在网络接口(网卡图标)下，在“BSD”下查找“en0”，并检查设备是否在“内置”下有复选标记。如果有一个复选标记，跳过到修复ROM部分，否则继续阅读。

* **注意**:`en0`可以是Wifi、ethernet甚至Thunderbolt。类型并不重要，只要它存在并标记为内置即可。

### 如果我根本没有En0怎么办?

好吧，我们要重置macOS的网络设置，这样它就可以重新构建界面;打开终端并运行以下命令:

```
sudo rm /Library/Preferences/SystemConfiguration/NetworkInterfaces.plist
sudo rm /Library/Preferences/SystemConfiguration/preferences.plist
```

一旦完成，重启并再次检查。

如果这不起作用，添加[NullEthernet.kext](https://bitbucket.org/RehabMan/os-x-null-ethernet/downloads/)和[ssdt-rmne.aml](https://github.com/RehabMan/OS-X-Null-Ethernet/blob/master/ssdt-rmne.aml)分别到您的EFI和config.plist下的Kernel -> add和ACPI -> add。SSDT是预编译的，因此不需要额外的工作，提醒编译后的文件具有.aml扩展名，.dsl可以视为源代码。

### 使en0显示为内置

![Find if set as Built-in](../images/post-install/iservices-md/en0-built-in-info.png)

现在，在Hackintool的PCI选项卡下，导出PCI DeviceProperties，这将在桌面上创建一个pcidevices.plist

![Export PCI address](../images/post-install/iservices-md/hackintool-export.png)

现在搜索pcidevices.plist,找到你的PciRoot以太网控制器。对我们来说，这将是`PciRoot(0x0)/Pci(0x1f,0x6)`

![Copy PciRoot](../images/post-install/iservices-md/find-en0.png)

现在有了PciRoot，进入你的config plist -> DeviceProperties ->添加并应用`built`属性，类型为`Data`，值为`01`

![Add to config.plist](../images/post-install/iservices-md/config-built-in.png)

## 修复ROM

这是一个很多人可能已经忘记的部分，但它可以在你的 config.plist 文件 PlatformInfo -> Generic -> ROM 下看到

要找到实际的MAC地址/ROM值，你可以在以下几个地方找到:

* BIOS
* macOS: 系统首选项—>网络—>以太网—>高级—>硬件—> MAC地址
* Windows: 设置->网络和互联网->以太网->以太网->物理MAC地址

* **注意**:en0可以是Wifi、以太网甚至Thunderbolt，根据你的情况调整上面的例子。

有些用户甚至使用真实的MAC地址转储来配置，在本指南中我们将使用真实的MAC地址，但请注意，这是另一种选择。

当将其添加到你的配置中时，`c0:7e:bf:c3:af:ff`应该被转换为`c07ebfc3afff`，因为`Data`类型不能接受冒号(`:`)。

![](../images/post-install/iservices-md/config-rom.png)

## 验证NVRAM

许多人忘记了NVRAM对iServices的正确工作至关重要，原因是iMessage密钥等都存储在NVRAM中。如果没有NVRAM, iMessage既不能看到也不能存储密钥。

因此，我们需要验证NVRAM是否可以工作，不管它是否“应该工作”，因为某些固件可能比其他固件更麻烦。

请参阅OpenCore指南的[模拟NVRAM](../misc/NVRAM.md)部分，以进行测试(如果您有可用的NVRAM)和模拟(如果没有)。

## 清除旧的尝试

对于那些尝试设置iMessage但失败的人来说，这很重要，首先要确保你的NVRAM已被清除。您可以在config plist -> Misc -> Security -> AllowNvramReset下启用AllowNvramReset选项。

打开终端，运行如下命令:

```
bash
sudo rm -rf ~/Library/Caches/com.apple.iCloudHelper*
sudo rm -rf ~/Library/Caches/com.apple.Messages*
sudo rm -rf ~/Library/Caches/com.apple.imfoundation.IMRemoteURLConnectionAgent*
sudo rm -rf ~/Library/Preferences/com.apple.iChat*
sudo rm -rf ~/Library/Preferences/com.apple.icloud*
sudo rm -rf ~/Library/Preferences/com.apple.imagent*
sudo rm -rf ~/Library/Preferences/com.apple.imessage*
sudo rm -rf ~/Library/Preferences/com.apple.imservice*
sudo rm -rf ~/Library/Preferences/com.apple.ids.service*
sudo rm -rf ~/Library/Preferences/com.apple.madrid.plist*
sudo rm -rf ~/Library/Preferences/com.apple.imessage.bag.plist*
sudo rm -rf ~/Library/Preferences/com.apple.identityserviced*
sudo rm -rf ~/Library/Preferences/com.apple.ids.service*
sudo rm -rf ~/Library/Preferences/com.apple.security*
sudo rm -rf ~/Library/Messages
```

## 最后一次验证你的工作

从[最新的OpenCore版本](https://github.com/acidanthera/OpenCorePkg/releases)抓取macserial并运行以下命令:

```
path/to/macserial -s
```

这将为我们提供系统的完整概要，验证所呈现的内容与您的工作相匹配。

## 清理你的AppleID

* 从你的AppleID中删除所有设备:[管理你的设备](https://appleid.apple.com/account/manage)
* 启用2 Factor-Auth
* 从Keychain中删除所有iServices，例如:

```
ids: identity-rsa-key-pair-signature-v1
ids: identity-rsa-private-key
ids: identity-rsa-public-key
ids: message-protection-key
ids: message-protection-public-data-registered
ids: personal-public-key-cache
iMessage Encryption Key
iMessage Signing Key
com.apple.facetime: registrationV1
等 ...
```

最后一层预防措施是创建一个新的AppleID，以确保如果你最终将自己的账户列入黑名单，它不是你的主要账户。

::: tip 提示

给账户加一张支付卡，有足够的购买量也会有所帮助。虽然不是具体的，但你可以把AppleID看作一个信用评分，你是一个越好的苹果用户，他们就越有可能不会出现激活问题，或者更容易获得苹果支持

:::

## 客户代码错误

好吧，伙计，你做到了。你的AppleID列入黑名单。解决方法很简单，但并不漂亮，**你必须打电话给[苹果](https://support.apple.com/en-us/HT201232)**。否则，除了使用新帐户之外，没有任何其他程序。在打电话之前添加一张支付卡可以帮助使账户合法化，这样它看起来就不那么像一个机器人了。

![](../images/post-install/iservices-md/blacklist.png)

* 苹果联系方式有两种
  * Apple打电话给你:[Apple Support](https://getsupport.apple.com/)。你必须点击Apple ID，然后选择iCloud、Facetime和Messages。现在，你应该点击“立即与苹果通话”并输入你的电话号码
  * 您也可以联系苹果公司寻求支持和服务，在列表中查找您的国家，然后拨打电话:[苹果支持电话号码](https://support.apple.com/HT201232)
