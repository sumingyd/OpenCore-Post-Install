# 补丁总线ID

本节主要与那些无论连接器类型或SMBIOS补丁都无法使用某些显示输出的人有关，因为苹果对输出总线ID进行了硬编码，与你的硬件不匹配。为了解决这个问题，我们将手动修补这些总线ID以支持我们的硬件。

这一页会比较技术性，因为我们已经假定你已经读完了前面的几页，并且对WhateverGreen有了一定的了解。

* [修补显示类型](./connector.md)
* [对macOS的VRAM要求进行修补](./vram.md)

## 解析帧缓冲区

首先，让我们假设我们使用的是一块带有UHD 630的Z390主板。这个系统在macOS中只使用iGPU，在使用某些显示输出时有问题，并且使用了`0x3E9B0007`帧缓冲器。

当我们从[WhateverGreen的手册](https://github.com/acidanthera/WhateverGreen/blob/master/Manual/FAQ.IntelHD.en.md)上看这个帧缓冲器时，我们看到以下情况：

```
ID: 3E9B0007, STOLEN: 57 MB, FBMEM: 0 bytes, VRAM: 1536 MB, Flags: 0x00801302
TOTAL STOLEN: 58 MB, TOTAL CURSOR: 1 MB (1572864 bytes), MAX STOLEN: 172 MB, MAX OVERALL: 173 MB (181940224 bytes)
GPU Name: Intel UHD Graphics 630
Model Name(s):
Camelia: Disabled
Mobile: 0, PipeCount: 3, PortCount: 3, FBMemoryCount: 3
[1] busId: 0x05, pipe: 9, type: 0x00000400, flags: 0x000003C7 - DP
[2] busId: 0x04, pipe: 10, type: 0x00000400, flags: 0x000003C7 - DP
[3] busId: 0x06, pipe: 8, type: 0x00000400, flags: 0x000003C7 - DP
01050900 00040000 C7030000
02040A00 00040000 C7030000
03060800 00040000 C7030000
```

现在让我们把它解析为BusID信息，因为这就是我们要修补的内容：

```
[1] busId: 0x05, pipe: 9, type: 0x00000400, flags: 0x000003C7 - DP
[2] busId: 0x04, pipe: 10, type: 0x00000400, flags: 0x000003C7 - DP
[3] busId: 0x06, pipe: 8, type: 0x00000400, flags: 0x000003C7 - DP
01050900 00040000 C7030000
02040A00 00040000 C7030000
03060800 00040000 C7030000
```

在这里，我们看到这个帧缓冲器的特性中列出了3个总线ID，让我们试着把它们分解，以便更容易理解。让我们来看看第1条：

```
[1] busId: 0x05, pipe: 9, type: 0x00000400, flags: 0x000003C7 - DP
01050900 00040000 C7030000
```

| Bit | Name | Value |
| :--- | :--- | :--- |
| Bit 1 | Port | `01` |
| Bit 2 | Bus ID | `05` |
| Bit 3-4 | Pipe Number | `0900` |
| Bit 5-8 | Connector Type | `00040000` |
| Bit 9-12 | Flags | `C7030000` |

需要记住的事情。

* BusID是一个唯一的值，不能被多个条目使用
* 连接器类型的值与[连接器类型修补页](./connector.md)中讨论的相同。

## 映射视频端口

这里我们有两个部分。

* [macOS内的映射](#mapping-withinb-macos)
  * 你可以启动macOS并使用至少一个显示器。
* [不使用macOS的映射](#mapping-without-macos)
  * 在所有显示器上黑屏
  
### 在macOS中的映射

在macOS中映射视频是相当容易的，因为我们可以假设我们的一个端口在帧缓冲器中被正确映射。

在这个例子中，我们将解释常见的[HDMI-hotplug fix for Kaby lake users](https://sumingyd.github.io/OpenCore-Install-Guide/config-laptop.plist/kaby-lake.html#deviceproperties)。首先，让我们看一下`0x591B0000`帧缓冲区：

```
ID: 591B0000, STOLEN: 38 MB, FBMEM: 21 MB, VRAM: 1536 MB, Flags: 0x0000130B
TOTAL STOLEN: 39 MB, TOTAL CURSOR: 1 MB (1572864 bytes), MAX STOLEN: 136 MB, MAX OVERALL: 137 MB (144191488 bytes)
Model name: Intel HD Graphics KBL CRB
Camellia: CamelliaDisabled (0), Freq: 1388 Hz, FreqMax: 1388 Hz
Mobile: 1, PipeCount: 3, PortCount: 3, FBMemoryCount: 3
[0] busId: 0x00, pipe: 8, type: 0x00000002, flags: 0x00000098 - ConnectorLVDS
[2] busId: 0x04, pipe: 10, type: 0x00000800, flags: 0x00000187 - ConnectorHDMI
[3] busId: 0x06, pipe: 10, type: 0x00000400, flags: 0x00000187 - ConnectorDP
00000800 02000000 98000000
02040A00 00080000 87010000
03060A00 00040000 87010000
```

在这里，我们看到第2条是HDMI端口，但是在真正的Kaby lake笔记本电脑上，热插拔导致机器内核崩溃的情况非常普遍。这是由于总线ID和端口与硬件不完全一致造成的。

为了解决这个问题，我们要把它打成更合适的东西（即把`0204`改为 `0105`，这些都是经过测试可以正常工作的）。

有2种方法来修补。

* [替换整个条目](#replace-the-entire-entry)
* [替换条目的部分内容](#replace-sectons-of-the-entry)

#### 替换整个条目

要替换整个条目，我们首先要找到我们的条目，并确保它被正确枚举。这是因为Apple的条目从0开始，并依次递增。

* con0
* con1
* con2

因此，由于条目2是列表中的第二个，我们要使用con1。

* framebuffer-con2-enable

接下来让我们打补丁，我们知道端口需要打成`01`，BusID改成`05`:

* <code>**0105**0A00 00080000 87010000</code>

最后，我们得到了以下补丁。

```
framebuffer-patch-enable | Data | `01000000`
framebuffer-con2-enable  | Data | `01000000`
framebuffer-con2-alldata | Data | `01050A00 00080000 87010000`
```

#### 替换条目的各个部分

要替换条目的某些部分，我们首先要找到我们的条目，并确保它被正确列举出来。这是因为苹果公司的条目从0开始，然后依次递增。

* `con0`
* `con1`
* `con2`

因此，由于条目2是列表中的第二个，我们要使用con1。

* `framebuffer-con1-enable`。

接下来让我们打补丁，我们知道端口需要打成01，BusID改成05。

* framebuffer-con2-index = `01`
* framebuffer-con2-busid = `05`

最后，我们得到了这些补丁:

```
framebuffer-patch-enable | Data | `01000000`
framebuffer-con2-enable  | Data | `01000000`
framebuffer-con2-index   | Data | `01`
framebuffer-con2-busid   | Data | `05`
```

### 没有macOS的映射

映射你的显示器输出是相当简单的，*然而*是相当耗时的，因为你需要尝试每一个BusID值，直到你得到一个输出。

在这个例子中，我们将再次使用0x3E9B0007帧缓冲器。

```
[1] busId: 0x05, pipe: 9, type: 0x00000400, flags: 0x000003C7 - DP
[2] busId: 0x04, pipe: 10, type: 0x00000400, flags: 0x000003C7 - DP
[3] busId: 0x06, pipe: 8, type: 0x00000400, flags: 0x000003C7 - DP
01050900 00040000 C7030000
02040A00 00040000 C7030000
03060800 00040000 C7030000
```

首先，我们将试图通过条目1的BusIDs，希望能找到工作值。

##### 1. 在这里插上你的HDMI显示器

##### 2. 将端口1设置为HDMI连接器类型

* <code>01xx0900 **00080000** C7030000</code>

::: details 支持的连接器类型

macOS中支持的常见连接器类型

```
<02 00 00 00>        LVDS 和 eDP      - 笔记本显示器
<10 00 00 00>        VGA               - 在10.8和更新的版本中不被支持
<00 04 00 00>        DisplayPort       - USB-C显示输出内部为DP
<01 00 00 00>        DUMMY             - 在没有物理端口时使用
<00 08 00 00>        HDMI
<80 00 00 00>        S-Video
<04 00 00 00>        DVI (双链路)
<00 02 00 00>        DVI (单链路)
```

提醒大家，Skylake和更新版本的VGA在内部实际上是DisplayPort，所以用这种连接器类型代替。

:::

##### 3. 用busid=00禁用端口2和3

* <code>02**00**0A00 00040000 C7030000</code>
* <code>03**00**0800 00040000 C7030000</code>

##### 4. 如果前面的方法不奏效，就走一遍端口1的busids。在大多数平台上，最大的busid一般是0x06

* <code>01**01**0900 00080000 C7030000</code>
* <code>01**02**0900 00080000 C7030000</code>
* <code>01**03**0900 00080000 C7030000</code>
* 等

如果还是没有输出，把端口1的母线设置为00，然后开始查看端口2的母线，依次类推。

* port 1 = <code>01000900 00040000 C7030000</code>
* port 2 = <code>02**xx**0A00 00080000 C7030000</code>
* port 3 = <code>03000800 00040000 C7030000</code>

#### 添加到你的config.plist中

你现在要在 `DeviceProperteies -> Add -> PciRoot(0x0)/Pci(0x2,0x0)`中添加以下补丁:

```
framebuffer-patch-enable | Data | `01000000`
framebuffer-con0-enable  | Data | `01000000`
framebuffer-con1-enable  | Data | `01000000`
framebuffer-con2-enable  | Data | `01000000`
framebuffer-con0-alldata | Data | port 1 (ie. `01010900 00080000 C7030000`)
framebuffer-con1-alldata | Data | port 2 (ie. `02000A00 00040000 C7030000`)
framebuffer-con2-alldata | Data | port 3 (ie. `03000800 00040000 C7030000`)
```

请注意:

* 端口1将被标记为`con0`
* 端口1的BusID被设置为`01'
* 端口2和3的BusID被设置为`00'，禁用它们

完成后，你应该得到类似的东西:

![](../../images/gpu-patching/path-done.png)

如前所述，如果这个组合不起作用，就增加端口1的BusID，如果还不起作用，就禁用端口1的BusID，然后尝试端口2，以此类推。
