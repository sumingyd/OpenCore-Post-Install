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

From here, lets open up our config.plist and head to DeviceProperties -> Add. Now we'll want to add a new Entry called `PciRoot(0x0)/Pci(0x2,0x0)`. This is the location of Intel's iGPUs relative to the IOService path, and has been consistent as far back as Yonah series CPUs(2007+):

| Key | Type | Value |
| :--- | :--- | :--- |
| AAPL,ig-platform-id | Data | 0300220D |

![](../../images/gpu-patching/ig-platform.png)

### device-id explainer

`device-id` is what macOS, or more specifically IOKit, uses to determine which devices are allowed to connect to which drivers. Why this is important for us is that Apple's iGPU drivers have a limited amount of IDs even though the kext itself can support much more.

To determine whether you need a new `device-id` injected, you'll want to compare [WhateverGreen's list of supported IDs](https://github.com/acidanthera/WhateverGreen/blob/master/Manual/FAQ.IntelHD.en.md) to what you have.

For this example, lets take a look at the i3-4150 with an HD 4400 iGPU. Using [Intel's ARK page](https://ark.Intel.com/content/www/us/en/ark/products/77486/Intel-core-i3-4150-processor-3m-cache-3-50-ghz.html), we can see the following:

```
Device ID = 0x41E
```

Now that we have our actual Device ID, lets compare it to [WhateverGreen's list](https://github.com/acidanthera/WhateverGreen/blob/master/Manual/FAQ.IntelHD.en.md):

```
Native supported DevIDs:

 0x0d26
 0x0a26
 0x0a2e
 0x0d22
 0x0412
```

Unfortunately the ID is not present in macOS, so we'll need to find a similar iGPU to ours and use their Device ID. The HD 4600 found in the [i3-4330](https://ark.Intel.com/content/www/us/en/ark/products/77769/Intel-core-i3-4330-processor-4m-cache-3-50-ghz.html) is a very close match, so we'll use its Device ID:

```
Device ID = 0x412
```

However, by default this cannot be injected. We'll need to first pad it to 8 bits and hex swap:

```md
# First, remove 0x and pad it to 8 bits by using 0's in front of it
0x412 -> 00 00 04 12

# Next reverse it, but keep the pairs in tact
00 00 04 12 -> 12 04 00 00

# And voila, you have your device-id
12040000 = device-id
```

Now that we have our device-id, we'll do the same thing as before with ig-platform-id. Open your config.plist and add this new entry under `PciRoot(0x0)/Pci(0x2,0x0)`:

| Key | Type | Value |
| :--- | :--- | :--- |
| device-id | Data | 12040000 |

![](../../images/gpu-patching/device-id.png)

## Learning to patch with WhateverGreen

Now that we've gone over the basics of setting up an iGPU, let's get into some deeper topics. We'll need to go over some  prerequisites first:

* Lilu and WhateverGreen are present under EFI/OC/Kexts and in your config.plist
  * To verify if they loaded correctly in macOS, run the below command(if nothing is outputted, the kexts are not loading)
  * `kextstat | grep -E "Lilu|WhateverGreen"`
* `DeviceProperties -> Add -> PciRoot(0x0)/Pci(0x2,0x0)` has been correctly setup
  * Refer to your specific generation in the [config.plist section](https://sumingyd.github.io/OpenCore-Install-Guide/)

Now head forth into your framebuffer patching journey!:

* [Patching the VRAM requirement of macOS](./vram.md)
  * Relevant for systems with locked BIOS and cannot increase the VRAM
* [Patching the display type](./connector.md)
  * Relevant for systems where you may get distorted colors on certain monitors
* [Patching the display connections](./busid.md)
  * Relevant for systems where certain display outputs do not work
