# 修复DRM支持和iGPU性能

* **注意**:Safari 14和macOS 11, Big Sur目前不受WhateverGreen的DRM补丁支持。不过，在卡特琳娜及更老版本的Safari 13支持得还不错。
* **注2**:浏览器不使用基于硬件的DRM (ie Mozilla Firefox或基于Chrome的浏览器，如谷歌Chrome和Microsoft Edge)将有工作的DRM，而无需在igpu和dgpu上进行任何工作。以下指南是使用基于硬件的DRM Safari和其他应用程序。

关于DRM，我们有几点需要提一下:

* DRM需要支持的dGPU
  * 有关支持的卡，请参阅[GPU购买者指南](https://sumingyd.github.io/GPU-Buyers-Guide/)
* 仅igpu系统的DRM损坏
  * 这个问题可以在10.12.2之前用Shiki(现在的WhateverGreen)修复，但在10.12.3时被破坏了
  * 这是由于我们的igpu不支持苹果的固件，我们的[管理引擎](https://en.wikipedia.org/wiki/Intel_Management_Engine) 没有苹果的证书
* 工作硬件加速和解码

## 测试硬件加速和解码

因此，在我们开始修复DRM之前，我们需要确保您的硬件是工作的。最好的检查方法是运行 [VDADecoderChecker](https://i.applelife.ru/2019/05/451893_10.12_VDADecoderChecker.zip):

![](../images/post-install/drm-md/vda.png)

如果你在这一点上失败了，你可以检查以下几点:

* 确保您的硬件支持
  * 参见[GPU购买指南](https://sumingyd.github.io/GPU-Buyers-Guide/)
* 确保你正在运行的SMBIOS与你的硬件匹配
  * 例如，不要在台式机上使用Mac Mini SMBIOS，因为Mac Mini运行的是移动硬件，所以macOS也会有同样的要求
* 确保iGPU在BIOS中是启用的，并且具有正确的设置属性(`AAPL,ig-platform-id`，如果需要，`device-id`)
  * 您可以查看指南中的DeviceProperties部分或[WhateverGreen的手册](https://github.com/acidanthera/WhateverGreen/blob/master/Manual/FAQ.IntelHD.en.md)
* 避免不必要的ACPI重命名，所有重要的重命名都由WhateverGreen处理
  * change GFX0 to IGPU
  * change PEG0 to GFX0
  * change HECI to IMEI
  * [等](https://github.com/dortania/OpenCore-Install-Guide/blob/master/clover-conversion/Clover-config.md)
* 确保Lilu和WhateverGreen已加载
  * 确保没有任何遗留的图形补丁，因为它们已经被合并到WhateverGreen中:
    * IntelGraphicsFixup.kext
    * NvidiaGraphicsFixup.kext
    * Shiki.kext

检查Lilu和WhateverGreen是否正确加载:

```
kextstat | grep -E "Lilu|WhateverGreen"
```

> 这些kext中的一个或多个没有出现

一般来说，最好的开始是通过查看你的OpenCore日志，看看Lilu和WhateverGreen是否正确注入:

```
14:354 00:020 OC: Prelink injection Lilu.kext () - Success
14:367 00:012 OC: Prelink injection WhateverGreen.kext () - Success
```

如果它说注射失败:

```
15:448 00:007 OC: Prelink injection WhateverGreen.kext () - Invalid Parameter
```

你可以查看的主要地方是:

* **注射顺序**:确保Lilu在WhateverGreen上面
* **所有的kext都是最新版本**:对于Lilu插件尤其重要，因为不匹配的kext可能会导致问题

注意:要设置文件日志，请参阅 [OpenCore 调试](https://sumingyd.github.io/OpenCore-Install-Guide/troubleshooting/debug.html).

**注**:在macOS 10.15及更新版本上，AppleGVA调试默认是关闭的，如果你在运行VDADecoderChecker时得到一个通用错误，你可以使用以下命令打开调试:

```
defaults write com.apple.AppleGVA enableSyslog -boolean true
```

并撤销此操作:

```
defaults delete com.apple.AppleGVA enableSyslog
```

## 测试DRM

因此，在我们深入讨论之前，我们需要回顾一些事情，主要是你将在现实中看到的DRM类型:

**FairPlay 1.x**: 基于软件的DRM，可以更好地支持legacy mac

* 最简单的测试方法是播放iTunes电影: [FairPlay 1.x test](https://drive.google.com/file/d/12pQ5FFpdHdGOVV6jvbqEq2wmkpMKxsOF/view)
  * FairPlay 1.x预告片将在任何配置上工作，如果WhateverGreen被正确设置-包括只有igpu的配置。然而，FairPlay 1.x *电影*将只在仅支持igpu的配置上播放大约3-5秒，之后会误以为HDCP不支持。

**FairPlay 2.x/3.x**: 基于硬件的DRM，可以在Netflix、Amazon Prime中找到

* 有几个方法测试:
  * 在Netflix或Amazon Prime上播放节目
  * 播放 Amazon Prime 预告片: [蜘蛛侠: 英雄远征](https://www.amazon.com/Spider-Man-Far-Home-Tom-Holland/dp/B07TP6D1DP)
    * 预告片本身并不使用DRM，但亚马逊仍然会在播放前进行检查
* 注意:需要更新的AMD GPU才能工作(Polaris+)

**FairPlay 4.x**: 混合DRM，在AppleTV+上找到

* 您可以打开TV.app，选择TV+ ->免费Apple TV+首映，然后点击任何一集进行测试，无需任何试用(您需要一个iCloud帐户)
* 如果你想使用Apple TV+，也可以免费试用
* 注意:需要没有iGPU (Xeon)或更新的AMD GPU工作(Polaris+)
  * 当iGPU不存在时，可以强制FairPlay 1.x

如果在这些测试中一切正常，则无需继续!否则,继续。

## 修复DRM

因此，要修复DRM，我们主要可以走一条路:为DRM打补丁，使用软件或AMD解码。Vit为不同的硬件配置制作了一个很棒的小图表:

* [WhateverGreen的DRM图标](https://github.com/acidanthera/WhateverGreen/blob/master/Manual/FAQ.Chart.md)

那么如何使用它呢?首先，确定你在图表中有什么配置(AMD代表GPU，而不是CPU)。列出的SMBIOS (IM = iMac, MM = Mac Mini, IMP = iMac Pro, MP = Mac Pro)是你应该使用的，如果你匹配硬件配置。如果你没有匹配图表中的任何配置，你就不走运了。

接下来，确定你需要使用什么Shiki模式。如果您的设置有两种配置，它们将在使用的Shiki标志上有所不同。通常，硬件解码比软件解码更重要。如果mode列为空，则操作完成。否则，你应该使用DeviceProperties > add将`shikigva`作为属性添加到任何GPU。例如，如果我们需要使用的模式是`shikigva=80`:

![Example of shikigva in Devices Properties](../images/post-install/drm-md/dgpu-path.png)

你也可以使用启动参数——它位于mode列中。

这里有一个例子。如果我们有一个Intel i9-9900K和一个RX 560，配置将是“AMD+IGPU”，我们应该使用iMac或Mac Mini SMBIOS(对于这个特定的配置，iMac19,1)。然后我们看到配置有两个选项:一个是模式为`shikigva=16`，另一个是`shikigva=80`。我们在“Prime预告片”和“Prime/Netflix”中看到了区别。我们希望Netflix能正常工作，所以我们选择`shikigva=80`选项。然后将类型为数字/整数和值为`80`的`shikigva`注入到我们的iGPU或dGPU中，重新启动，DRM应该可以工作了。

这是另一个例子。这次，我们有一个Ryzen 3700X和一个RX 480。在这种情况下，我们的配置只有“AMD”，我们应该使用iMac Pro或Mac Pro SMBIOS。同样，有两个选项:不设置shiki参数，以及设置`shikigva=128`。我们更喜欢硬件解码而不是软件解码，因此我们将选择`shikigva=128`选项，并再次将`shikigva`注入我们的dGPU，这次的值为`128`。重新启动后DRM开始工作。

**注意:**

* 你可以使用[gfxutil](https://github.com/acidanthera/gfxutil/releases)找到iGPU/dGPU的路径。
  * `path/to/gfxutil -f GFX0`
  * `GFX0`: 表示dGPUs，如果安装了多个，请检查IORegistryExplorer中AMD卡的名称
  * `IGPU`: 表示IGPU
* 如果你使用DeviceProperties注入`shikigva`，请确保只对一个GPU执行此操作，否则WhateverGreen将使用它首先找到的任何内容，并且不能保证一致性。
* IQSV代表英特尔快速同步视频:这仅在iGPU存在并启用并正确设置时有效。
* 特殊配置(如Haswell + AMD dGPU和iMac SMBIOS，但iGPU是禁用的)不在图表中。你必须自己做研究。
* [Shiki 来源](https://github.com/acidanthera/WhateverGreen/blob/master/WhateverGreen/kern_shiki.hpp) 有助于理解标志的作用以及何时使用它们，并可能有助于特殊配置。
* 对于Big Sur下的 `VDADecoderCreate failed. err: -12473` 错误,强制使用AMD解码器(在适用的系统上)可以帮助解决这个问题:

    ```sh
    defaults write com.apple.AppleGVA gvaForceAMDAVCDecode -boolean yes
    ```
