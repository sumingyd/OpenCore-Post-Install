# 修复RTC写入问题

本节试图教授的是如何解决某些机器重启/唤醒时的RTC(CMOS)问题。最常见的是像下面的图片。

![credit to u/iDrakus for the image](../images/post-install/rtc-md/cmos-error.png)

这些CMOS和安全模式错误发生的原因是由于AppleRTC写到了某些硬件不支持的区域，从而导致了崩溃和错误。

为了解决这个问题，我们通常用[这些类型的补丁](https://github.com/RehabMan/HP-ProBook-4x30s-DSDT-Patch/blob/master/config_parts/config_master.plist#L291L296)阻止所有的RTC写入，但由于许多原因，这些补丁并不理想，包括破坏Windows和Linux以及禁用潜在的支持区域，如电源管理。

因此，对于OpenCore，我们有几个选项可以选择。

* 给AppleRTC打上补丁，使其不能写入特定区域。
  * 他们可能在未来的操作系统更新中被破坏
  * 对终端用户来说，打补丁要困难得多
  * 不处理EfiBoot对RTC的写入。
* 省略坏区域的可写性
  * 他们可能在未来的固件更新中被破坏
  * 终端用户更容易打补丁
  * 防止EfiBoot也会破坏你的系统

前者实际上已经通过 `DisableRtcChecksum`集成到OpenCore中了，但它的缺点是只能阻止0x58-0x59区域，而且只能在内核层工作。要知道这个选项是否是最好的，最好的办法是启用它并尝试。如果这不起作用，就禁用，因为这是一个不必要的补丁。

有了后者，我们就能封锁我们选择的非常具体的区域，与我们的确切型号相匹配。而且，我们能够在内核层面和固件支持休眠的情况下做到这一点。然而这需要更多的时间和[RTCMemoryFixup](https://github.com/acidanthera/RTCMemoryFixup/releases)。

## 找到我们的坏RTC区域

在本指南的其余部分，我们将假设你已经测试了选项1(`DisableRtcChecksum`)，但没有成功，或者你在EfiBoot写到RTC时有问题。为了开始，我们应该先介绍一些想法。

* RTC将有从0到255的区域。
* 这些区域将采用十六进制的计数系统，所以实际上是0x00-0xFF。
* 为了省略不好的区域，我们使用启动参数`rtcfx_exclude=00-FF`。
  * 用你的坏区域(或区域)替换`00-FF`。
  * 提醒你，`boot-args`位于你的config.plist中`NVRAM -> Add -> 7C436110-AB2A-4BBB-A880-FE41995C9F82`下。
  * 这也需要你在config.plist和EFI/OC/Kexts文件夹下有[RTCMemoryFixup](https://github.com/acidanthera/RTCMemoryFixup/releases)。
* 可能有多个坏的区域
* 为了找到坏区域，我们要把搜索分成几块。

关于分块，我们要做的是省略RTC区域的分块，直到我们缩小到足够精确的坏点。你可以看看下面的内容，了解如何开始。

#### 1. 测试RtcMemoryFixup

* 首先，你需要在启动参数中添加`rtcfx_exclude=00-FF`。如果重启后，RTC错误似乎解决了，这将告诉你你的CMOS错误是否与RTC有关。

#### 2. 将0x00-0xFF分成2个

* 0x00-0x7F和0x80-0xFF
  * 写下能解决RTC错误的排除范围，然后继续将更多的内容分成几块
  * 例如：`rtcfx_exclude=00-7F`修复了RTC错误，所以你要把它分成一半，不要考虑更多的`rtcfx_exclude=80-FF`。
* 测试`rtcfx_exclude=00-7F`和`rtcfx_exclude=80-FF`。
  * 注意你也可能得到一个7F-80的坏范围，甚至是分成多个部分的坏区域（例如0x00-0x01 **和** 0x80-0x81）。
  * 你可以使用`rtcfx_exclude=00-01,7F-80`来解决这个问题。

#### 3. 在测试了哪些区域是坏的之后，再缩减一下

* 假设我们的坏区域在0x80-0xFF内，接下来你要把它分成两部分。
* 0x80-0xBF和0xC0-0xFF
  * 如果你有多个区域是坏的

#### 4. 而你将以这种模式继续下去，直到你缩小了坏区域的范围。请注意，你每次都需要重新启动，以测试你是否仍然得到CMOS/安全模式错误

* 还要注意，最后的坏点通常是一个范围，而不是一个单一的点。
* 例如：`rtcfx_exclude=85-86`而不是一个单一的值。

**专业提示**。要找到一个介于两个区域之间的值，我建议首先将十六进制转换为十进制，然后运行以下公式。

* `(x + y) / 2`。

现在，让我们试着将此与前面的步骤1一起使用。

* 0x00-0xFF -> 0-255 -> `(0 + 255) / 2` = 127.5

现在用127.5，你将向上和向下取整，得到你们自己的结束和开始值。

* 0-127 -> 0x00-0x7F

* 128-255 -> 0x80-0xFF

希望这能帮助你更好地理解你是如何从第1步得到我们的数值的。

## 使黑名单更持久

一旦你找到了坏的RTC区域，你现在可以最终将其添加到OpenCore本身，并允许该区域在固件层面被列入黑名单。

为此，打开你的config.plist，进入`NVRAM -> Add`部分。在 `4D1FDA02-38C7-4A6A-9CC6-4BCCA8B30102`GUID下，你要添加一个名为`rtc-blacklist`的新条目。

接下来，你要把我们的不良RTC区域作为一个数组加入，所以`rtcfx_exclude=85-86`将变成`rtc-blacklist | Data | 8586`。这也适用于更长的范围，如85-89等，但对于`rtc-blacklist`，你必须包括每个条目（即`<85 86 87 88 89>`）。一旦你设置了`rtc-blacklist`，请记得删除启动参数。

接下来确保你也设置了`NVRAM -> Delete`，因为除非明确告知，否则NVRAM变量将不会被OpenCore覆盖。

完成这一切后，你应该有与下面类似的东西。

![](../images/post-install/rtc-md/rtc-blacklist.png)
