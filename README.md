# OpenCore 安装后

欢迎来到OpenCore安装后指南!请注意，如果您还没有安装macOS，我们建议您遵循我们的安装指南:

* [OpenCore安装指南](https://sumingyda.github.io/OpenCore-Install-Guide/)

虽然这里的信息可以应用到OpenCore和Clover，我们主要关注的是OpenCore安装。所以，如果你遇到任何问题，你需要做更多的研究。

## 如何遵循本指南

首先，本指南中并非每一节都必须完整。这取决于每个用户是否觉得他们想要添加最后的润色或解决某些问题

本指南分为8个部分:

* [通用](#universal)
  * 建议所有用户遵循
* [USB修复](#usb-fixes)
  * 建议所有用户也遵循
* [安全](#security)
  * 针对那些关心安全和隐私的人。
* [笔记本电脑细节](#laptop-specifics)
  * 除上述外，建议笔记本电脑用户遵循
* [美化](#cosmetics)
  * 美化，如OpenCore GUI和删除启动期间的详细屏幕输出
* [多引导](#multiboot)
  * 多引导用户的建议
* [杂项](#miscellaneous)
  * 其他杂项修复，并不是所有用户都需要这些修复
* [GPU修补](#gpu-patching)
  * 更深入地了解如何为macOS打补丁以支持各种GPU硬件

### 通用

* [修复音频](./universal/audio.md)
  * 对于那些需要帮助解决音频问题的人。
* [无需USB启动](./universal/oc2hdd.md)
  * 允许您在不安装USB的情况下启动OpenCore。
* [更新OpenCore, kexts和macOS](./universal/update.md)
  * 如何安全地更新你的kext, OpenCore甚至macOS。
* [修复DRM](./universal/drm.md)
  * 对于那些有DRM问题的人，比如Netflix播放。
* [修复iServices](./universal/iservices.md)
  * 帮助解决诸如iMessage之类的杂项服务问题。
* [修复电源管理](./universal/pm.md)
  * 修复并帮助改善硬件空闲和增强状态。
* [修复睡眠](./universal/sleep.md)
  * 修复睡眠时要检查的地方很多。

### USB 修复

* [USB映射:介绍](./usb/README.md)
  * USB问题的起点，如缺少端口和帮助睡眠。

### 安全

* [安全性和文件库](./universal/security.md)
  * 这里我们来设置一些OpenCore很棒的安全特性

### 笔记本细节

* [修复电池读数](./laptop-specific/battery.md)
  * 如果您的电池不支持SMCBatteryManager开箱即用。

### 美化

* [添加GUI和开机铃声](./cosmetic/gui.md)
  * 为OpenCore添加一个花哨的GUI，甚至是一个启动铃声!
* [修复分辨率和啰嗦模式](./cosmetic/verbose.md)
  * 帮助修复OpenCore的分辨率，并允许您在启动时获得那个甜美的苹果标志!
* [修复macpro7,1内存错误](./universal/memory.md)
  * 修复macpro7,1启动时的内存错误

### 多重引导

* [OpenCore 多重引导](https://dortania.github.io/OpenCore-Multiboot/)
  * 使用OpenCore进行多重引导的专用指南
* [设置启动选项](./multiboot/bootstrap.md)
  * 确保Windows不会从我们的系统中删除OpenCore。
* [安装BootCamp](./multiboot/bootcamp.md)
  * 允许我们安装Bootcamp，便于引导切换。

### 杂项

* [修复RTC](./misc/rtc.md)
  * 帮助解决RTC / CMOS /安全模式重新启动问题。
* [修复CFG锁](./misc/msr-lock.md)
  * 允许删除一些内核补丁以获得更好的稳定性
* [模拟NVRAM](./misc/nvram.md)
  * NVRAM损坏或需要测试的用户。

### GPU修补

* [深入的GPU修补](./gpu-patching/README.md)
