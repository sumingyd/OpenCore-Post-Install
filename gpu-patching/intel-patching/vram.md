# 给VRAM打补丁

本节主要与那些不能解锁BIOS以增加分配给iGPU的VRAM的用户有关，这将导致macOS的内核崩溃。为了解决这个问题，我们首先要确定帧缓冲器所需的最小VRAM量，然后打补丁使其要求更少。

在这个例子中，让我们举一个Haswell Lake帧缓冲器，它通常用于桌面Haswell iGPU。`0x0D220003`(`0300220D`当十六进制互换时)

现在让我们看看[WhateverGreen的手册](https://github.com/acidanthera/WhateverGreen/blob/master/Manual/FAQ.IntelHD.en.md)中的相应信息(注意你需要点击 "Spoiler: Azul connectors")

```
ID: 0D220003, STOLEN: 32 MB, FBMEM: 19 MB, VRAM: 1536 MB, Flags: 0x00000402
TOTAL STOLEN: 52 MB, TOTAL CURSOR: 1 MB (1572864 bytes), MAX STOLEN: 116 MB, MAX OVERALL: 117 MB (123219968 bytes)
Camellia: CamelliaDisabled (0), Freq: 5273 Hz, FreqMax: 5273 Hz
Mobile: 0, PipeCount: 3, PortCount: 3, FBMemoryCount: 3
[1] busId: 0x05, pipe: 9, type: 0x00000400, flags: 0x00000087 - ConnectorDP
[2] busId: 0x04, pipe: 10, type: 0x00000400, flags: 0x00000087 - ConnectorDP
[3] busId: 0x06, pipe: 8, type: 0x00000400, flags: 0x00000011 - ConnectorDP
01050900 00040000 87000000
02040A00 00040000 87000000
03060800 00040000 11000000
```

这里重要的是前两行。

```
ID: 0D220003, STOLEN: 32 MB, FBMEM: 19 MB, VRAM: 1536 MB, Flags: 0x00000402
TOTAL STOLEN: 52 MB, TOTAL CURSOR: 1 MB (1572864 bytes), MAX STOLEN: 116 MB, MAX OVERALL: 117 MB (123219968 bytes)
```

这里是我们关心的主要条目。

| Entry | Value | Comment |
| :--- | :--- | :--- |
| STOLEN | 32MB | 保留给iGPU的内存 |
| FBMEM | 19MB | 为帧缓冲器保留的内存 |
| TOTAL CURSOR | 1 MB | 为游标保留的内存 |
| TOTAL STOLEN | 52 MB | 以上的组合 |

例如，你的主板只为iGPU分配了32MB的内存，这对于帧缓冲器所期望的来说太少了，所以当它试图写入一个不存在的内存区域时，很可能会出现内核崩溃。

这就是WhateverGreen的补丁功能的作用，在这里我们可以通过以下属性设置帧缓冲器所期望的iGPU内存的确切数量。

| Value | Comment |
| :--- | :--- |
| framebuffer-patch-enable | 这启用了WhateverGreen的补丁功能 |
| framebuffer-stolenmem | 这设置了`STOLEN`条目所使用的值 |
| framebuffer-fbmem | 这设置了`FBMEM`项使用的值 |

## 创建我们的补丁

因此，为了降低这个VRAM要求，我们要把`STOLEN`设置为19MB，`FBMEM`设置为9MB。这将使我们低于32MB的限制。

要做到这一点，我们运行以下命令来覆盖9MB。

```md
# 将9MB的兆字节转换成字节数
echo '9 * 1024 * 1024' | bc
 9437184

# 从十进制转换为十六进制
echo 'obase=16; ibase=10; 9437184' | bc
 900000

# 十六进制交换，以便能够正确注入
# 即成对地交换
900000 -> 90 00 00 -> 00 00 90

# 将数值填充到4个字节，最后是00
00 00 90 00
```

当我们对这两个值都这样做时，我们会得到:

* 19MB = `00 00 30 01`
* 9MB = `00 00 90 00`

当我们把它打入我们的WhateverGreen属性时。

| Key | Type | Value
| :--- | :--- | :--- |
| framebuffer-patch-enable | Data | 01000000 |
| framebuffer-stolenmem | Data | 00003001 |
| framebuffer-fbmem | Data | 00009000 |

* 对于`patch-enable`，01000000只是指被启用。

## 应用我们的补丁

现在我们打好了补丁，进入你的config.plist，然后在 `DeviceProperties -> Add -> PciRoot(0x0)/Pci(0x2,0x0)`下，添加属性。

![](../../images/gpu-patching/vram.png)
