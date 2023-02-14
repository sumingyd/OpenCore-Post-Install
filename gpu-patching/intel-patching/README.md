# 英特尔iGPU补丁

本指南将更深入地探讨修补macOS以支持英特尔iGPU的更多硬件变化，包括正确的显示输出，修复颜色色调问题，HiDPI问题等。注意本指南**不是**初学者教程，我们建议你按照指南中config.plist部分列出的推荐iGPU属性来开始。

本指南支持：

* Sandy Bridge到Ice Lake的iGPU

## 术语

| 术语 | 说明 |
| :--- | :--- |
| Framebuffer | 指的是macOS中用来驱动GPU的kext。 |
| Framebuffer Profile | 帧缓冲器中的配置文件，它决定了iGPU将如何行动。 |
| WhateverGreen | Kext用于修补GPU驱动，以更好地支持PC硬件。 |
| AAPL,ig-platform-id | macOS用来确定Ivy Bridge和更新版本的帧缓冲器配置文件的属性。 |
| AAPL,snb-platform-id | macOS用于确定Sandy Bridge的帧缓冲器配置的属性 |
| device-id | IOKit用于将硬件与kexts相匹配  |

## 开始工作

在我们跳入这个无底洞太深之前，我们应该先解释一下我们在做什么，以及为什么我们需要这样做。

**基本的主题**。

* [AAPL,ig-platform-id explainer](#aapl-ig-platform-id-explainer)
* [device-id explainer](#device-id-explainer)

### AAPL,ig-platform-id explainer

在带有iGPU的Mac中，默认情况下有几种配置。

* iGPU是唯一的显示输出
  * 常见于没有dGPU的Mac Minis、MacBook Airs、13英寸MacBook Pros和iMac上
* iGPU只用于内部显示，而dGPU则处理外部显示
  * 常见于15英寸MacBook Pro
* iGPU仅用于内部计算，而dGPU处理所有的显示输出
  * 常见于包含dGPU的iMac。

这一点之所以重要，是因为苹果在iGPU kexts中支持大量的iGPU配置，特别是被称为帧缓冲器个性。这些个性决定了许多事情，包括显示器的数量、允许的显示器类型、这些显示器的位置、所需的最小VRAM等，因此我们需要希望这些配置文件中有一个与我们的硬件相匹配，或者尝试修补它。

为了指定macOS中的帧缓冲器个性，我们使用OpenCore的DeviceProperties部分，添加一个名为`AAPL,ig-platform-id`的条目。

* 注意：在Sandy Bridge上，我们使用`AAPL,snb-platform-id`代替。

该条目的格式为十六进制，并与实际值进行了字节交换。这些值的完整列表可以在WhateverGreen的手册中找到。[FAQ.IntelHD.en.md](https://github.com/acidanthera/WhateverGreen/blob/master/Manual/FAQ.IntelHD.en.md)

在这个例子中，让我们尝试找到一个与桌面HD4600 iGPU兼容的帧缓存。我们首先要向下滚动手册，直到找到[Intel HD Graphics 4200-5200（Haswell处理器）](https://github.com/acidanthera/WhateverGreen/blob/master/Manual/FAQ.IntelHD.en.md#Intel-hd-graphics-4200-5200-haswell-processors)条目。在这里，我们得到了一份macOS中所有支持的帧缓冲器的列表，包括硬件类型（即移动与桌面）、VRAM要求等。如果你滚动到这个列表的底部，你还会得到一些推荐选项。

```
台式机:
 0x0D220003 (默认)
笔记本电脑:
 0x0A160000 (默认)
 0x0A260005 (推荐)
 0x0A260006 (推荐)
空的帧缓冲区。
 0x04120004 (默认)
```

前两个条目是非常明显的，但是最后一个条目（Empty Framebuffer）指的是系统已经设置了dGPU，但是仍然在后台启用了iGPU来处理任务，比如硬件加速解码等它擅长的任务。

现在，由于我们使用的是台式机HD4600，我们将抓取相应的帧缓冲器配置文件。`0x0D220003`。

现在，我们不能在我们的config.plist中使用它。原因是它是大尾数的，而macOS的IOS服务树希望它是小尾数的。然而，要转换它非常简单。

```md
# 开始时，去掉0x，然后将它们成对隔开
0x0D220003 -> 0D 22 00 03

# 接下来，颠倒顺序，但保持成对排列
0D 22 00 03 -> 03 00 22 0D

# And now you have your final framebuffer profile
0300220D = AAPL,ig-platform-id
```

从这里，让我们打开我们的config.plist，并前往DeviceProperties -> Add。现在我们要添加一个新条目，名为 `PciRoot(0x0)/Pci(0x2,0x0)`。这是英特尔iGPU相对于IOS服务路径的位置，从Yonah系列CPU（2007年以上）开始，这个位置就一直是一致的。

| Key | Type | Value |
| :--- | :--- | :--- |
| AAPL,ig-platform-id | Data | 0300220D |

![](../../images/gpu-patching/ig-platform.png)

### device-id解释

“device-id”是macOS，或者更具体地说是IOKit用来确定允许哪些设备连接到哪些驱动程序的参数。这对我们来说很重要，因为苹果的iGPU驱动器的id数量有限，而kext本身可以支持更多的id。

要确定是否需要注入新的“device-id”，你需要将[WhateverGreen的支持id列表](https://github.com/acidanthera/WhateverGreen/blob/master/Manual/FAQ.IntelHD.en.md)与你所拥有的进行比较。

在这个例子中，让我们看看带有HD 4400 iGPU的i3-4150. 使用[英特尔方舟页面](https://ark.Intel.com/content/www/us/en/ark/products/77486/Intel-core-i3-4150-processor-3m-cache-3-50-ghz.html)，我们可以看到以下内容：

```
Device ID = 0x41E
```

现在我们有了实际的设备ID，让我们把它与[WhateverGreen的列表](https://github.com/acidanthera/WhateverGreen/blob/master/Manual/FAQ.IntelHD.en.md)进行比较。

```
本地支持的DevIDs。

 0x0d26
 0x0a26
 0x0a2e
 0x0d22
 0x0412
```

不幸的是，这个ID在macOS中不存在，所以我们需要找到一个与我们类似的iGPU并使用它们的设备ID。在[i3-4330](https://ark.Intel.com/content/www/us/en/ark/products/77769/Intel-core-i3-4330-processor-4m-cache-3-50-ghz.html)中发现的HD 4600是非常接近的，所以我们将使用它的设备ID。

```
Device ID = 0x412
```

然而，在默认情况下，这不能被注入。我们需要首先将其填充到8位，然后进行十六进制交换。

```md
# 首先，去掉0x，在它前面用0来填充到8位
0x412 -> 00 00 04 12

# 接下来将其反转，但保持对数不变
00 00 04 12 -> 12 04 00 00

# 然后，你就得到了你的设备ID
12040000 = device-id
```

现在我们有了我们的设备ID，我们将做与之前ig-platform-id相同的事情。打开你的config.plist，在 `PciRoot(0x0)/Pci(0x2,0x0)`下添加这个新条目。

| Key | Type | Value |
| :--- | :--- | :--- |
| device-id | Data | 12040000 |

![](../../images/gpu-patching/device-id.png)

## 学习用WhateverGreen打补丁

现在我们已经了解了设置iGPU的基础知识，让我们进入一些更深入的话题。我们首先需要了解一些前提条件。

* Lilu和WhateverGreen存在于EFI/OC/Kexts下和你的config.plist中。
  * 要验证它们在macOS中是否正确加载，运行下面的命令（如果没有输出，说明kexts没有被加载）
  * `kextstat | grep -E "Lilu|WhateverGreen"`。
* `DeviceProperties -> Add -> PciRoot(0x0)/Pci(0x2,0x0)`已经被正确设置。
  * 参考你在[config.plist](https://sumingyd.github.io/OpenCore-Install-Guide/)部分的具体生成

现在开始你的帧缓冲器补丁之旅吧！。

* [对macOS的VRAM要求进行修补](./vram.md)
  * 与锁定BIOS和不能增加VRAM的系统有关。
* [修补显示类型](./connector.md)
  * 与在某些显示器上可能得到失真的颜色的系统有关。
* [修补显示连接](./busid.md)
  * 与某些显示输出不工作的系统有关
