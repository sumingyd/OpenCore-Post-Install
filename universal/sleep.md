# 修复睡眠

因此，为了理解如何解决macOS中的睡眠问题，我们需要首先看看大多数情况下是什么导致了睡眠问题:

* 设备管理错误(最常见的是基于PCIe的设备)

原因是当设备获得S3调用(或S0用于唤醒)时，驱动程序需要关闭设备并进入低状态模式(唤醒时则相反)。当这些设备不与驱动程序合作时，问题就会出现，这些问题的主要违反者是:

* USB控制器和设备
* GPUs
* Thunderbolt 控制器和设备
* 网卡(包括以太网和Wifi)
* NVMe 驱动器

还有一些其他可能导致睡眠问题的因素与PCI/e没有直接(或明显)关系:

* CPU电源管理
* 显示
* NVRAM
* RTC/系统时钟
* IRQ冲突
* 音频
* SMBus
* TSC

很多人都忘记了一件事:

* CPUs
  * AVX经常会破坏iGPUs并损害整体稳定性
* 坏内存(超频和不匹配的内存)
  * 即使是糟糕/不匹配的时间也会导致严重的问题
* 工厂GPU超频
  * oem厂商通常在自定义VBIOS上对显卡做得有点过头
  * 通常这些显卡会有一个物理开关，允许你选择低功耗的VBIOS

## 准备工作

**在 macOS**:

在我们深入研究之前，我们首先要准备好我们的系统:

```
sudo pmset autopoweroff 0
sudo pmset powernap 0
sudo pmset standby 0
sudo pmset proximitywake 0
sudo pmset tcpkeepalive 0
```

这将为我们做5件事:

1. 禁用自动休眠:这是休眠的一种形式
2. 禁用powernap:用于定期唤醒机器以进行网络和更新(但不包括显示)
3. 禁用待机:用于睡眠和进入休眠之间的一段时间
4. 禁用iPhone/手表唤醒功能:特别是当你的iPhone或苹果手表靠近时，机器将唤醒
5. 关闭TCP保持激活机制，防止每2小时唤醒一次

**在你的 config.plist**:

虽然只需要最小的更改，但以下是我们关心的更改:

* `Misc -> Boot -> HibernateMode -> None`
  * 我们将避免使用S4的黑魔法
* `NVRAM -> Add -> 7C436110-AB2A-4BBB-A880-FE41995C9F82 -> boot-args`
  * `keepsyms=1` - 确保如果内核在睡眠期间发生崩溃，我们可以从中获取所有重要的信息
  * `swd_panic=1` - 避免了睡眠导致重启的问题，这应该给我们一个内核崩溃日志

**在你的 BIOS**:

* 禁用：
  * Wake on LAN
  * Trusted Platform Module
    * 请注意，如果你在Windows上使用BitLocker，禁用它将导致你所有的加密密钥丢失。如果你正在使用BitLocker，要么禁用，要么注意它可能是唤醒问题的原因。
  * Wake on USB(某些主板实际上可能需要这个来唤醒，但大多数将获得随机唤醒调用)
* 启用:
  * Wake on Bluetooth(如果使用蓝牙设备像键盘一样唤醒，否则可以禁用)
  
## 主要罪魁祸首

* [USB](#fixing-usb)
* [GPUs](#fixing-gpus)
* [Thunderbolt](#fixing-thunderbolt)
* [网卡](#fixing-nics)
* [NVMe](#fixing-nvme)
* [CPU电源管理](#fixing-cpu-power-management)

### 修复USB

这是导致黑苹果睡眠问题的首要原因，主要是因为苹果的驱动程序非常不擅长猜测端口，并且端口限制补丁会产生不稳定的不良影响。

* [USB 映射](../usb/README.md)

本指南还包括一些其他的修复，而不仅仅是映射:

* [修复USB电源](../usb/misc/power.md)
* [修复关机/重启](../usb/misc/shutdown.md)
* [GPRW/UPRW/LANC即时唤醒补丁](../usb/misc/instant-wake.md)
* [键盘唤醒问题](../usb/misc/keyboard.md)

**使用macOS Catalina(10.15)及更新版本的USB映射**:你可能会发现，即使使用USB映射，你的睡眠时间也会延长。一个可能的解决方案是将IOClass的值从`AppleUSBMergeNub`重命名为`AppleUSBHostMergeProperties`。查看这里了解更多信息:[卡特琳娜USB IOClass的变化](https://github.com/dortania/bugtracker/issues/15)

* 注意:某些USB设备在macOS中没有正确的驱动程序，可能会不幸导致睡眠问题。例如，带有USB寻址控制的海盗船水冷可以防止机器正常睡眠。对于这些情况，我们建议用户在调试睡眠问题时断开这些麻烦的设备。

### 修复GPUs

有了gpu，我们很容易就能知道是什么导致了问题。这是macOS中不支持的gpu。默认情况下，任何没有在操作系统中提供驱动程序的GPU都将运行非常基本的驱动程序，即VESA驱动程序。它们提供了最小的显示输出，但也导致了一个大问题，即macOS实际上不知道如何正确地与这些设备交互。要解决这个问题，我们需要欺骗macOS认为它是一个通用的PCIe设备(它可以更好地处理，非常适合台式机)，或者完全关闭卡(在笔记本电脑上，台式机dgpu有关机问题)

* 查看更多信息:
  * [禁用桌面显卡](https://sumingyd.github.io/Getting-Started-With-ACPI/Desktops/desktop-disable)
  * [禁用笔记本显卡](https://sumingyd.github.io/Getting-Started-With-ACPI/Laptops/laptop-disable)

10.15.4及更新版本iGPU用户的特别说明:

* iGPU唤醒部分是由于苹果公司在真正的mac上使用applegraphicpowermanagement.kext的大量黑客行为造成的，为了解决这个问题，你可能需要`igfxonln=1`来强制所有显示在线。显然，首先要进行测试，以确保您有这个问题。
* A对于桌面 Coffee Lake (UHD 630) 的用户来说，AAPL,ig-platform-id `07009B3E`可能会失败，你可以试试`00009B3E`。`0300923E`有时也是有效的。

其他iGPU注意事项:

* 一些使用igpu的系统(例如Kaby Lake和Coffee Lake)可能会在低功耗状态下导致系统不稳定，有时会表现为NVMe内核崩溃。要解决这个问题，你可以在你的引导参数中添加`forceRenderStandby=0`来禁用RC6备用渲染。查看这里了解更多信息:[IGP导致NVMe内核恐慌CSTS=0xffffffff#1193](https://github.com/acidanthera/bugtracker/issues/1193)
* 由于转换状态的问题，某些Ice Lake笔记本电脑也可能在“不允许DC6而不允许DC9”时出现内核崩溃。一种解决方法是在你的启动参数中使用`-noDC9`或`-nodisplaysleepDC6`

AMD dgpu 4k显示器的特别注意事项:

* 某些显示器可能无法随机唤醒，主要是由AGDC首选项引起的。要修复这个问题，请在DeviceProperties中将其应用到dGPU上:
  * `CFG,CFG_USE_AGDC | Data | 00`
  * 你可以通过[gfxutil](https://github.com/acidanthera/gfxutil/releases)找到GPU的PciRoot
    * `/path/to/gfxutil -f GFX0`

![](../images/post-install/sleep-md/agdc.png)

### 修复Thunderbolt

Thunderbolt在社区中是一个非常棘手的话题，主要是由于情况的复杂性。如果你想让Thunderbolt和sleep同时工作，你真的只有两条路可走:

* 在BIOS中禁用Thunderbolt 3
* 尝试修补Thunderbolt 3:
  * [Thunderbolt 3 修复](https://osy.gitbook.io/hac-mini-guide/details/thunderbolt-3-fix/)
  * [ThunderboltReset](https://github.com/osy86/ThunderboltReset)
  * [ThunderboltPkg](https://github.com/al3xtjames/ThunderboltPkg/blob/master/Docs/FAQ.md)

注意:Thunderbolt可以在不需要额外工作的情况下启用，**如果**你不需要睡眠也没问题，反之亦然。

### 修复网卡

网卡(网络接口控制器)与睡眠很容易修复,主要是以下几点:

* 在BIOS中禁用WakeOnLAN
  * 大多数系统将进入睡眠/唤醒循环启用
* 在macOS中禁用`Wake for network access` (SystemPreferences -> Power)
  * 似乎能破解很多hack
  
### 修复NVMe

所以macOS对NVMe驱动非常挑剔，而且苹果的电源管理驱动仅限于苹果品牌的驱动。所以要做的主要事情是:

* 确保NVMe在最新固件上(对于[970 Evo Plus驱动器](https://www.tonymacx86.com/threads/do-the-samsung-970-evo-plus-drives-work-new-firmware-available-2b2qexm7.270757/page-14#post-1960453)尤其重要)
* 使用[NVMeFix.kext](https://github.com/acidanthera/NVMeFix/releases)来进行适当的NVMe电源管理

并避免问题驱动，主要罪魁祸首:

* 三星的PM981和PM991固态硬盘
* Micron的2200S

如果你的系统中有这些驱动器，最好通过SSDT禁用它们:[禁用桌面dgpu](https://sumingyd.github.io/Getting-Started-With-ACPI/Desktops/desktop-disable.html)。
本指南主要针对dGPU，但对NVMe驱动器的工作原理完全相同(因为它们都只是PCIe设备)。
  
### 修复CPU电源管理

**来自 Intel**:

要验证您是否有工作的CPU电源管理，请参阅[固定电源管理](../universal/pm.md) page.

还要注意，不正确的电源管理数据可能导致唤醒问题，因此请验证您正在使用正确的SMBIOS。

一个常见的内核唤醒错误是:

```
Sleep Wake failure in EFI
```

**来自 AMD**:

不要着急，因为他们对你还有希望![AMDRyzenCPUPowerManagement.kext](https://github.com/trulyspinach/SMCAMDProcessor)可以添加基于Ryzen cpu电源管理。仓库的README.md中解释了安装和使用方法

## 其他罪魁祸首

* [显示](#displays)
* [NVRAM](#nvram)
* [RTC](#rtc)
* [IRQ 冲突](#irq-conflicts)
* [音频](#audio)
* [SMBus](#smbus)
* [TSC](#tsc)

### 显示

所以显示问题主要是针对笔记本电脑的盖子检测，具体来说:

* 错误制作SSDT-PNLF
* 操作系统与固件的盖子唤醒
* 键盘垃圾从盖子唤醒它(基于PS2的键盘)

前者很容易修复，参见这里:[背光PNLF](https://sumingyd.github.io/Getting-Started-With-ACPI/)

对于中间部分，macOS的盖子唤醒检测可能有点坏，你可能需要完全禁用它:

```sh
sudo pmset lidwake 0
```

并设置`lidwake 1`来重新启用它。

后者需要更多的工作。我们要做的是试图消除在Skylake和更新的基于HPs上发生的半随机密钥垃圾邮件，尽管在其他oem中也会出现。这也将假设你的键盘是基于PS2并且正在运行[VoodooPS2](https://github.com/acidanthera/VoodooPS2/releases).

要解决这个问题，请获取[SSDT-HP-FixLidSleep.dsl](https://github.com/acidanthera/VoodooPS2/blob/master/Docs/ACPI/SSDT-HP-FixLidSleep.dsl)并将ACPI路径调整到您的键盘(`_CID`值为`PNP0303`)。一旦完成，编译并放入EFI/OC/ACPI和config plist -> ACPI -> Add。

对于99%的HP用户来说，这将解决随机密钥的垃圾问题。如果没有，请参阅下面的帖子:

* [RehabMan的亮度键指南](https://www.tonymacx86.com/threads/guide-patching-dsdt-ssdt-for-laptop-backlight-control.152659/)

### NVRAM

要验证您有工作的NVRAM，请参阅[模拟NVRAM](../misc/ NVRAM. md)页面来验证您有工作的NVRAM。如果没有，则相应地打补丁。

### RTC

这主要与Intel 300系列主板(Z3xx)有关，具体来说有两个问题:

* 默认RTC是禁用的(而不是使用AWAC)
* RTC通常与macOS不兼容

To get around the first issue, see here: [Fixing AWAC](https://sumingyd.github.io/Getting-Started-With-ACPI/Universal/awac.html)

For the second one, it's quite easy to tell you have RTC issues when you either shutdown or restart. Specifically you'll be greeted with a "BIOS Restarted in Safemode" error. To fix this, we'll need to prevent macOS from writing to the RTC regions causing these issues. There are a couple fixes:

* DisableRtcChecksum: Prevent writing to primary checksum (0x58-0x59), works with most boards
* `UEFI -> ProtoclOverride -> AppleRtcRam` + `NVRAM -> Add -> rtc-blacklist`
  * Blacklists certain regions at the firmware level, see [Configuration.pdf](https://github.com/acidanthera/OpenCorePkg/blob/master/Docs/Configuration.pdf) for more info on how to set this up
* [RTCMemoryFixup](https://github.com/acidanthera/RTCMemoryFixup) + `rtcfx_exclude=`
  * Blacklists certain regions at the kernel level, see README for more info on how to setup

With some legacy boards, you may actually need to patch your RTC: [Z68 RTC](https://www.insanelymac.com/forum/topic/329624-need-cmos-reset-after-sleep-only-after-login/)

### IRQ Conflicts

IRQ issues usually occur during bootups but some may notice that IRQ calls can break with sleep, this fix is fairly easy:

* [SSDTTime](https://github.com/corpnewt/SSDTTime)
  * First dump your DSDT in Linux/Windows
  * then select `FixHPET` option

This will provide you with both SSDT-HPET.aml and `patches_OC.plist`, You will want to add the SSDT to EFI/OC/ACPI and add the ACPI patches into your config.plist from the patches_OC.plist

### Audio

Unmanaged or incorrectly managed audio devices can also cause issues, either disable unused audio devices  in your BIOS or verify they're working correctly here:

* [Fixing Audio](../universal/audio.md)

### SMBus

Main reason you'd care about SMBus is AppleSMBus can help properly manage both SMBus and PCI devices like with power states. Problem is the kext usually won't load by itself, so you'll need to actually create the SSDT-SMBS-MCHC.

See here on more info on how to make it: [Fixing SMBus support](https://sumingyd.github.io/Getting-Started-With-ACPI/Universal/smbus.html)

### TSC

The TSC(Time Stamp Counter) is responsible for making sure you're hardware is running at the correct speed, problem is some firmware(mainly HEDT/Server and Asus Laptops) will not write the TSC to all cores causing issues. To get around this, we have 3 options:

* [CpuTscSync](https://github.com/lvs1974/CpuTscSync/releases)
  * For troublesome laptops
* [VoodooTSCSync](https://bitbucket.org/RehabMan/VoodooTSCSync/downloads/)
  * For most HEDT hardware
* [TSCAdjustReset](https://github.com/interferenc/TSCAdjustReset)
  * For Skylake X/W/SP and Cascade Lake X/W/SP hardware
  
The former 2 are plug n play, while the latter will need some customizations:

* Open up the kext(ShowPackageContents in finder, `Contents -> Info.plist`) and change the Info.plist -> `IOKitPersonalities -> IOPropertyMatch -> IOCPUNumber` to the number of CPU threads you have starting from `0`(i9 7980xe 18 core would be `35` as it has 36 threads total)
* Compiled version can be found here: [TSCAdjustReset.kext](https://github.com/dortania/OpenCore-Install-Guide/blob/master/extra-files/TSCAdjustReset.kext.zip)

![](../images/post-install/sleep-md/tsc.png)

The most common way to see the TSC issue:

Case 1    |  Case 2
:-------------------------:|:-------------------------:
![](../images/troubleshooting/troubleshooting-md/asus-tsc.png)  |  ![](../images/troubleshooting/troubleshooting-md/asus-tsc-2.png)
