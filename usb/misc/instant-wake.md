# GPRW/UPRW/LANC即时唤醒补丁

与“修复关机/重启”部分类似，如果睡眠期间USB或电源状态发生变化，macOS将立即唤醒。为了解决这个问题，我们需要将GPRW/UPRW/LANC调用重新路由到一个新的SSDT，在尝试以下操作之前，请验证您是否存在即时唤醒问题。

最好的检查方法:

```sh
pmset -g log | grep -e "Sleep.*due to" -e "Wake.*due to"
```

通常你会得到这样的结果:

* `Wake [CDNVA] due to GLAN: Using AC`
  * 通常是由启用WakeOnLAN引起的，请首先在BIOS中禁用此选项
  * 如果不是WOL的问题，你可以尝试下面的补丁
* `Wake [CDNVA] due to HDEF: Using AC`
  * 类似于GLAN问题
* `Wake [CDNVA] due to XHC: Using AC`
  * 通常是由于启用了WakeOnUSB引起的，请首先在BIOS中禁用此选项
  * 可能需要GPRW补丁
* `DarkWake from Normal Sleep [CDNPB] : due to RTC/Maintenance Using AC`
  * 一般由小睡引起
* `Wake reason: RTC (Alarm)`
  * 通常是由应用程序唤醒系统引起的，在睡觉前退出该应用程序应该可以解决这个问题

**不要一次使用所有这些补丁**，查看你的DSDT，看看你有哪些补丁:

| SSDT | ACPI Patch | Comments |
| :--- | :--- | :--- |
| [SSDT-GPRW](https://github.com/dortania/OpenCore-Post-Install/blob/master/extra-files/SSDT-GPRW.aml) | [GPRW to XPRW Patch](https://github.com/dortania/OpenCore-Post-Install/blob/master/extra-files/GPRW-Patch.plist) | 如果你的ACPI中有`Method (GPRW, 2`，请使用它 |
| [SSDT-UPRW](https://github.com/dortania/OpenCore-Post-Install/blob/master/extra-files/SSDT-UPRW.aml) | [UPRW to XPRW Patch](https://github.com/dortania/OpenCore-Post-Install/blob/master/extra-files/UPRW-Patch.plist) | 如果你的ACPI中有`Method (UPRW, 2`，请使用此方法 |
| [SSDT-LANC](https://github.com/dortania/OpenCore-Post-Install/blob/master/extra-files/SSDT-LANC.aml) | [LANC to XPRW Patch](https://github.com/dortania/OpenCore-Post-Install/blob/master/extra-files/LANC-Patch.plist) | 如果你的ACPI中有`Device (LANC)`，请使用它 |

ACPI补丁和SSDTs由 [Rehabman](https://www.tonymacx86.com/threads/guide-using-clover-to-hotpatch-acpi.200137/), [1Revenger1](https://github.com/1Revenger1) 和 [Fewtarius](https://github.com/dortania/laptop-guide) 提供
