# 修复CFG锁

本指南只推荐给已经安装了macOS的用户，对于第一次安装的用户，请在`Kernel -> Quirks`中启用`AppleCpuPmCfgLock` 和 `AppleXcpmCfgLock` 。

* 注意，本指南只适用于英特尔用户。AMD用户没有任何类型的CFG锁。

## 什么是CFG-锁

CFG-Lock 是 BIOS 中的一个设置，它允许写入一个特定的寄存器（在这里是 MSR 0xE2）。默认情况下，大多数主板都会锁定这个变量，许多主板甚至在GUI中直接隐藏了这个选项。我们关心的原因是macOS实际上想写这个变量，而不仅仅是macOS的一个部分。相反，内核（XNU）和AppleIntelPowerManagement都想要这个寄存器。

所以要解决这个问题，我们有两个选择。

#### 1. 给macOS打补丁，使其与我们的硬件一起工作

* 这对许多人来说会造成不稳定和不必要的修补。
* 我们为此使用的2个补丁。
  * `AppleCpuPmCfgLock`用于AppleIntelPowerManagement.kext
  * `AppleXcpmCfgLock`用于内核(XNU)

#### 2. 给我们的固件打补丁，以支持MSR E2的编写

* 非常喜欢，因为可以避免打补丁，在稳定性和操作系统升级方面有更大的灵活性。
  
注意：基于Penyrn的机器实际上不需要担心解锁这个寄存器。

## 检查你的固件是否支持CFG锁的解锁

在进行本指南的其余部分之前，你首先需要检查你的固件是否支持CFG锁的解锁。
要检查它，你可以通过两种方式进行。

1. [使用OpenCore的DEBUG版本，检查日志中关于CFG锁的内容](#checking-via-opencore-logs)
2. [使用一个叫做`ControlMsrE2`的工具，它将加快整个检查过程](#checking-via-ControlMsrE2)

### 通过OpenCore日志进行检查

对于喜欢使用DEBUG版本的用户，你要启用OpenCore的DEBUG变体，将`Target`设置为`67`，然后启动OpenCore。这将为您提供一个格式为`opencore-YYY-MM-DD-hhmmss.txt`的文件，位于驱动器的根目录下。

在这个文件中，搜索 `OCCPU: EIST CFG Lock`:

```
OCCPU: EIST CFG Lock 1
```

如果它返回`1`，那么你就按这里的指南进行。[禁用CFG锁](#disabling-cfg-lock)。

否则（即`0`），没有理由继续，你可以简单地禁用 `Kernel -> Quirks -> AppleCpuPmCfgLock` 和 `Kernel -> Quirks -> AppleXcpmCfgLock`.

### 通过ControlMsrE2进行检查

首先，下载[ControlMsrE2](https://github.com/acidanthera/OpenCorePkg/releases)，并将该工具添加到`EFI/OC/Tools`和`config.plist`中（这可以通过ProperTree的快照功能（即Cmd+R）完成）。接下来，启动OpenCore并选择`ControlMsrE2.efi`条目。这应该为您提供以下信息之一。

* CFG-锁已经启用。

```
This firmware has LOCKED MSR 0xE2 register!
```

* CFG-锁被禁用。

```
This firmware has UNLOCKED MSR 0xE2 register!
```

对于前者，请在这里继续。[禁用CFG锁](#disabling-cfg-lock)。

对于后者，你不需要做任何CFG-Lock补丁，可以简单地禁用 `Kernel -> Quirks -> AppleCpuPmCfgLock`和`Kernel -> Quirks -> AppleXcpmCfgLock`。

## 禁用CFG锁

所以，你已经创建了EFI文件夹，但在CFG锁之前，你仍然无法启动，因为没有解锁。为了做到这一点，你将需要以下内容。

在你的`EFI/OC/Tools`文件夹和`config.plist`中，添加以下工具（这可以用ProperTree的快照功能（即Cmd+R）来完成）。

* [修改过的GRUB Shell](https://github.com/datasone/grub-mod-setup_var/releases)

还有一些应用程序来帮助我们。

* [UEFITool](https://github.com/LongSoft/UEFITool/releases) (请确保是UEFITool而不是UEFIExtract)
* [Universal-IFR-Extractor](https://github.com/LongSoft/Universal-IFR-Extractor/releases)

最后一个部分，从供应商的网站上抓取你的BIOS。

现在是有趣的部分!

## 手动关闭CFG-Lock

**请注意，只有华硕、微星和华擎的固件可以通过UEFITool直接打开。其他固件需要一个特殊的程序，我们将不直接在本指南中介绍。对于戴尔的固件，请参考[dreamwhite的指南](https://github.com/dreamwhite/bios-extraction-guide/tree/master/Dell)**。

1. 用UEFITool打开你的固件，然后找到`CFG Lock`这个Unicode字符串。如果没有弹出，那么你的固件不支持 `CFG Lock`，否则继续下去。

![](../images/extras/msr-lock-md/uefi-tool.png)

1. 你会发现这个字符串是在Setup文件夹中找到的，右击并导出为`Setup.bin`（甚至是`Setup.sct`）。
2. 用`ifrextract`打开你的设置文件，用终端导出为.txt文件。

   ```
   path/to/ifrextract path/to/Setup.bin path/to/Setup.txt
   ```

3. 打开文本文件，搜索`CFG Lock, VarStoreInfo (VarOffset/VarName):`并注意它后面的偏移量（如：`0x43`）和偏移量后面的VarStore ID（如：`0x3`）。
![](../images/extras/msr-lock-md/MSR-Find.png)

4. 搜索`VarStoreId: 0x3`，其中`0x3`被替换为你找到的VarStoreId的值，并注意它后面的`名称`(即：`CpuSetup`)

![](../images/extras/msr-lock-md/VarStoreID-Find.png)

1. 运行修改后的GRUB Shell并编写以下命令，其中`CpuSetup`被替换为你之前提取的VarStore Name，`0x43`被替换为你之前提取的offset。

   ```
   setup_var_cv CpuSetup 0x43 0x01 0x00
   ```

在这一点上，在shell中运行`reboot`，或者直接重启你的机器。这样一来，你应该已经解开了 `CFG锁`! 为了验证，你可以运行[Checking if your firmware supports CFG Lock unlocking](#checking-if-your-firmware-supports-cfg-lock-unlocking)中列出的方法来验证变量是否被正确设置，然后最后禁用`Kernel -> Quirks -> AppleCpuPmCfgLock`和`Kernel -> Quirks -> AppleXcpmCfgLock`。

* 请注意，变量偏移量不仅对每块主板是唯一的，甚至对其固件版本也是唯一的。**在没有检查的情况下，千万不要尝试使用偏移量。**

然后你就完成了! 现在你将拥有正确的CPU电源管理

**注意**。每次你重新设置你的BIOS时，你都需要再次翻转这个位，确保把它和BIOS的版本一起写下来，以便你知道是哪一个。

**注2**。一些 OEM（如联想）可能设置了这个变量，但如果不对 BIOS 进行物理修改就无法解锁，对于这些情况，你可能需要使用 [RU](http://ruexe.blogspot.com/) 这样的工具。[CFG LOCK/Unlocking - Alternative method](https://www.reddit.com/r/hackintosh/comments/hz2rtm/cfg_lockunlocking_alternative_method/)
