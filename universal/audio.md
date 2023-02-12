# 修复AppleALC的音频

首先，我们假设你已经安装了Lilu和AppleALC，如果你不确定它们是否被正确加载，你可以在终端中运行以下命令(这也会检查AppleHDA是否被加载，因为没有这个AppleALC就没有什么可以打补丁):

```sh
kextstat | grep -E "AppleHDA|AppleALC|Lilu"
```

如果3个都出现了，你就可以开始了。并确保VoodooHDA **不存在**。否则这将与AppleALC冲突。

如果您遇到问题，请参阅[故障排除部分](../universal/audio.md#troubleshooting)

## 找到你的 layout ID

在这个例子中，我们假设你的编解码器是ALC1220。要验证你的选择，你有两个选择:

* 检查主板规格页和说明书
* 检查Windows中的设备管理器
* 在Windows中检查HWInfo64
  * 打开时，请确保取消选择“仅限摘要”和“仅限传感器”
* 在Windows中检查AIDA64 Extreme
* 在Linux终端中运行`cat`
  * `cat /proc/asound/card0/codec#0 | less`

现在有了编解码器，我们需要将它与AppleALC支持的编解码器列表进行交叉引用:

* [AppleALC支持的编解码器](https://github.com/acidanthera/AppleALC/wiki/Supported-codecs)

使用ALC1220，我们得到以下结果:

```
0x100003, layout 1, 2, 3, 5, 7, 11, 13, 15, 16, 21, 27, 28, 29, 34
```

所以从这它告诉我们两件事:

* 支持哪个硬件版本(`0x100003`)，仅当以不同布局列出多个版本时相关
* 编解码器支持的各种布局id(`layout 1, 2, 3, 5, 7, 11, 13, 15, 16, 21, 27, 28, 29, 34`)

现在有了一个受支持的布局id列表，我们准备进行一些尝试

**注意**:如果你的音频编解码器是ALC 3XXX，这很可能是错误的，只是重新命名的控制器，请进行研究，看看实际的控制器是什么。

* 一个这样的例子是ALC3601，但是当我们加载Linux时，真实的名称显示为:ALC 671

## 测试你的布局

为了测试我们的布局id，我们将使用引导参数`alcid=xxx`，其中xxx是你的布局。请记住，**一次只尝试一个**布局id。不要添加多个ID或alcid在boot-args中, 如果一个不工作，然后尝试下一个ID等

```
config.plist
├── NVRAM
  ├── Add
    ├── 7C436110-AB2A-4BBB-A880-FE41995C9F82
          ├── boot-args | String | alcid=11
```

如果没有布局ID工作，尝试为您的系统创建 [SSDT-HPET fixes](https://sumingyd.github.io/Getting-Started-With-ACPI/Universal/irq.html) 这些在笔记本电脑和一些台式机上是必需的，以便AppleHDA工作。

## 使 Layout ID 更永久

一旦你找到了一个与你的黑苹果有效的布局ID，我们可以创建一个更永久的解决方案，更接近真实的mac如何设置他们的布局ID。

在AppleALC中，有一个优先级层次结构来区分属性的优先级:

1. `alcid=xxx` 引导参数，用于调试和覆盖所有其他值
2. `alc-layout-id` 中的' alc-layout-id '， **只能在苹果硬件上使用**
3. `layout-id` 中的' layout-id '， **应该在苹果和非苹果硬件上使用**

首先，我们需要找到音频控制器在PCI地图上的位置。为此，我们将使用一个名为 [gfxutil](https://github.com/acidanthera/gfxutil/releases) 的方便工具，然后与macOS终端一起使用:

```sh
path/to/gfxutil -f HDEF
```

![](../images/post-install/audio-md/gfxutil-hdef.png)

然后将这个带有子元素`layout-id`的PciRoot添加到配置中。

![](../images/post-install/audio-md/config-layout-id.png)

注意AppleALC可以接受十进制/Number和十六进制/Data，通常最好的方法是十六进制，因为你可以避免任何不必要的转换。你可以使用一个简单的[十进制到十六进制计算器](https://www.rapidtables.com/convert/number/decimal-to-hex.html) 来找到你的答案。 `printf '%x\n' DECI_VAL`:

![](../images/post-install/audio-md/hex-convert.png)

所以在这个例子中，`alcid=11`会变成:

* `layout-id | Data | <0B000000>`
* `layout-id | Number | <11>`

请注意，最终的十六进制/数据值总共应该是4个字节。`0B 00 00 00`)，对于超过255的布局id (`FF 00 00 00`)需要记住字节是交换的。所以256会变成`00 01 00 00`

* 使用Decimal/Number方法可以完全忽略十六进制交换和数据大小

**提醒**:你**必须**删除引导参数，因为它总是优先级最高的，所以AppleALC会忽略所有其他条目，比如DeviceProperties

## 各种各样的问题

### AMD上没有麦克风

* 这是AMD运行AppleALC时常见的问题，特别是没有补丁来支持Mic输入。目前“最好”的解决方案是购买USB DAC/Mic或使用VoodooHDA.kext方法。众所周知，VoodooHDA的问题是不稳定，音频质量比AppleALC更差

### 来自Clover的相同布局ID在OpenCore上不起作用

这可能会对IRQ冲突造成影响，在Clover上有一整套自动应用的ACPI热补丁。修复这个有点痛苦，但[SSDTTime](https://github.com/corpnewt/SSDTTime)的 `FixHPET` 选项可以处理大多数情况。

对于RTC和HPET从USB和音频等其他设备获取irq的奇怪情况，您可以参考trashOS仓库中的[HP Compaq DC7900 ACPI 补丁](https://github.com/khronokernel/trashOS/blob/master/HP-Compaq-DC7900/README.md#dsdt-edits) 示例

### 10.15中电源状态改变时的内核崩溃

* 在config.plist中启用 PowerTimeoutKernelPanic
  * `Kernel -> Quirks -> PowerTimeoutKernelPanic -> True`

## 故障诊断

对于故障诊断,我们需要复习几件事:

* [检查你是否有正确的kexts](#checking-if-you-have-the-right-kexts)
* [检查AppleALC是否打补丁正确](#checking-if-applealc-is-patching-correctly)
* [检查AppleHDA是否为vanilla](#checking-applehda-is-vanilla)
* [AppleALC工作不一致](#applealc-working-inconsistently)
* [AppleALC不能正确地使用多个声卡](#applealc-not-working-correctly-with-multiple-sound-cards)
* [AppleALC在Windows重启后不能工作](#applealc-not-working-from-windows-reboot)

### 检查是否有正确的kext

首先，我们假设你已经安装了Lilu和AppleALC，如果你不确定它们是否被正确加载，你可以在终端中运行以下命令(这也会检查AppleHDA是否被加载，因为没有这个AppleALC就没有什么可以打补丁):

```sh
kextstat | grep -E "AppleHDA|AppleALC|Lilu"
```

如果3个都出现了，你就可以开始了。确保VoodooHDA **不存在**。否则这将与AppleALC冲突。确保系统中没有的其他kext:

* RealtekALC.kext
* CloverALC.kext
* VoodooHDA.kext
* HDA Blocker.kext
* HDAEnabler#.kext(# 可以是1、2或3)

> 嘿，Lilu和/或AppleALC没有出现

一般来说，最好的开始是通过查看你的OpenCore日志，看看Lilu和AppleALC是否正确注入:

```
14:354 00:020 OC: Prelink injection Lilu.kext () - Success
14:367 00:012 OC: Prelink injection AppleALC.kext () - Success
```

如果它说注入失败:

```
15:448 00:007 OC: Prelink injection AppleALC.kext () - Invalid Parameter
```

你可以查看的主要地方是:

* **注入顺序**:确保Lilu在kext顺序上高于AppleALC
* **所有的kext都是最新版本**:对于Lilu插件尤其重要，因为不匹配的kext可能会导致问题

Note: To setup file logging, see [OpenCore Debugging](https://sumingyd.github.io/OpenCore-Install-Guide/troubleshooting/debug.html).

### 检查AppleALC是否正确打补丁

所以对于AppleALC，检查补丁是否正确的最简单的事情之一是检查你的音频控制器是否被正确重命名。获取 [IORegistryExplorer](https://github.com/khronokernel/IORegistryClone/blob/master/ioreg-302.zip) ，看看你是否有一个HDEF设备:

![](../images/post-install/audio-md/hdef.png)

正如你从上面的图像中看到的，我们有以下几点:

* HDEF Device意味着我们的重命名完成了这项工作
* AppleHDAController连接意味着Apple的音频kext连接成功
* `alc-layout-id`是一个属性，表明我们的boot-arg/DeviceProperty注入成功
  * 注意:`layout-id | Data | 07000000`是默认布局，`alc-layout-id`将覆盖它并成为AppleHDA使用的布局

注意:**不要手动重命名你的音频控制器**，这可能会导致问题，因为AppleALC正在尝试打补丁。让AppleALC做它的工作。

**More examples**:

Correct layout-id           |  Incorrect layout-id
:-------------------------:|:-------------------------:
![](../images/post-install/audio-md/right-layout.png)  |  ![](../images/post-install/audio-md/wrong-layout.png)

As you can see from the above 2, the right image is missing a lot of AppleHDAInput devices, meaning that AppleALC can't match up your physical ports to something it can understand and output to. This means you've got some work to find the right layout ID for your system.

### 检查AppleHDA是否正常

本节主要针对那些用定制AppleHDA替换了库里AppleHDA的人，这将验证你的AppleHDA是否为正品:

```sh
sudo kextcache -i / && sudo kextcache -u /
```

这将检查签名对AppleHDA是否有效，如果无效，则需要为你的系统获取AppleHDA的原始副本并替换它，或者更新macOS(更新时kext将被清除)。只有手动打过补丁的AppleHDA才会出现这种情况，所以如果是新安装，你的签名不太可能出现问题。

### AppleALC工作不一致

有时会出现一些罕见的情况，比如你的硬件没有及时初始化AppleHDAController，从而导致没有声音输出。要解决这个问题，你可以:

在boot-args中指定延迟:

```
alcdelay=1000
```

或通过DeviceProperties(在你的HDEF设备中)指定:

```
alc-delay | Number | 1000
```

上面的引导参数/属性将使AppleHDAController延迟1000 ms(1秒)，注意ALC延迟不能超过[3000 ms](https://github.com/acidanthera/AppleALC/blob/2ed6af4505a81c8c8f5a6b18c249eb478266739c/AppleALC/kern_alc.cpp#L373)

### AppleALC不能正确处理多个声卡

在极少数情况下，你有2个声卡(例如内置Realtek和一个外部PCIe卡)，你可能想要避免使用你不使用或不需要补丁的AppleALC补丁设备(如本机PCIe卡)。如果你发现当外部音频控制器存在时，AppleALC不会给你的板载音频控制器打补丁，这一点尤其重要。

为了解决这个问题，我们首先需要确定我们的音频控制器的位置。最简单的方法是运行 [gfxutil](https://github.com/acidanthera/gfxutil/releases)并搜索PCI id:

```sh
/path/to/gfxutil
```

现在有了这个大输出，你需要找到你的PciRoot路径，例如，让我们使用创造性的Sound-Blaster AE-9PE PCIe声卡。为此，我们知道PCI ID是`1102:0010`。因此，查看我们的gfxutil输出，我们得到以下结果:

```
66:00.0 1102:0010 /PC02@0/BR2A@0/SL05@0 = PciRoot(0x32)/Pci(0x0,0x0)/Pci(0x0,0x0)
```

从这里，我们可以清楚地看到我们的PciRoot路径是:

```
PciRoot(0x32)/Pci(0x0,0x0)/Pci(0x0,0x0)
```

* **注意**:这将假设您知道外部声卡的供应商和设备ID。作为参考，这些是常见的供应商id:
  * Creative Labs: `1102`
  * AsusTek: `1043`
* **注意2**:您的ACPI和PciRoot路径看起来不同，因此请注意**您的** gfxutil输出

现在我们有了我们的PciRoot路径，我们终于可以打开config.plist并添加我们的补丁。

在DeviceProperties -> Add下，您将添加您的PciRoot(作为一个字典)与名为`external-audio`的子进程:

```
DeviceProperties
| --- > Add
 | --- > PciRoot(0x32)/Pci(0x0,0x0)/Pci(0x0,0x0)
  | ----> external-audio | Data | 01
```

![](../images/post-install/audio-md/external-audio.png)

完成这些后，你可以重新启动，AppleALC现在应该会忽略你的外部音频控制器!

### 重启Windows后AppleALC无法正常工作

如果你发现从Windows重新启动到macOS中断了音频，我们建议在boot-args中添加`alctcsel=1`，或者在DeviceProperties中将此属性添加到你的音频设备:

```
DeviceProperties
| --- > Add
 | --- > PciRoot(0x32)/Pci(0x0,0x0)/Pci(0x0,0x0)(Adjust to your device)
  | ----> alctcsel | Data | 01000000
```
