# 修补连接器类型

* 图片和信息基于[CorpNewt's Vanilla Guide](https://hackintosh.gitbook.io/-r-hackintosh-vanilla-desktop-guide/config.plist-per-hardware/coffee-lake#pink-purple-tint)

本节主要与那些在显示器（通常是HDMI端口）上出现黑屏或不正确颜色输出的用户有关。这是由于苹果公司在你的硬件上强制显示类型。为了解决这个问题，我们将修补苹果的连接器类型，以正确尊重我们的硬件。

在这个例子中，让我们来看看一个连接了HDMI显示器的UHD 630系统。这台机器已经被正确设置，但是在HDMI显示器上有一个粉红色/紫色的色调。

获得一份[IOReg](https://github.com/khronokernel/IORegistryClone/blob/master/ioreg-302.zip)的副本，搜索 `iGPU`条目。

![](../../images/gpu-patching/igpu-entry.png)

接下来，清除该条目，这样我们就可以看到iGPU设备。

![](../../images/gpu-patching/igpu-children.png)

正如我们在上面的截图中所看到的，我们有几个帧缓冲器的条目被列出。这些都是存在于framebuffer特型中的显示特型，并且都有自己的设置。

对我们来说，我们关心的是那些有`display0`子项的条目，因为这就是驱动物理显示器的东西。在这个例子中，我们可以看到它是`AppleIntelFramebuffer@1`。当我们选择它时，你会看到在左边的窗格中，它的属性 `connector-type`的值是`<00 04 00 00>`。而当我们看下面的列表时：

```
<02 00 00 00>        LVDS 和 eDP      - 笔记本电脑显示器
<10 00 00 00>        VGA               - 在10.8和更新的版本中不被支持
<00 04 00 00>        DisplayPort       - USB-C显示输出内部为DP
<01 00 00 00>        DUMMY             - 在没有物理端口时使用
<00 08 00 00>        HDMI
<80 00 00 00>        S-Video
<04 00 00 00>        DVI (双链路)
<00 02 00 00>        DVI (单链路)
```

* 注意：Skylake和更新版本的VGA在内部是DisplayPorts，所以被macOS支持。对于这些系统，请使用DisplayPort接口。

仔细观察，我们发现HDMI端口实际上被列为DisplayPort。这就是WhateverGreen的修补机制发挥作用的地方。

由于错误的端口位于AppleIntelFramebuffer@1，这就是端口1。接下来，我们要为con1启用WhateverGreen的修补机制，然后将连接器类型设置为HDMI。要做到这一点，我们在`DeviceProperties -> Add -> PciRoot(0x0)/Pci(0x2,0x0)`下设置以下属性。

* `framebuffer-patch-enable = 01000000`
  * 启用WhateverGreen的补丁机制
* `framebuffer-conX-enable = 01000000`
  * 启用WhateverGreen在conX上的补丁
* `framebuffer-conX-type = 00080000`
  * 设置端口为HDMI(`<00 08 00 00>`)

注意：记得将两个补丁中的`conX`替换为 `con1`，以反映我们想要固定的端口，然后按上面列出的值设置。

![](../../images/gpu-patching/connector-type-patch.png)
