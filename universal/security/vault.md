# 保险库

**什么是保险库?**

好的保险库是基于两个东西, vault.plist 和 vault.sig:

* vault.plist: 您的EFI的“快照”
* vault.sig: vault.plist的验证

这可以被视为OpenCore的安全启动，因此没有人可以在没有您的允许的情况下修改它并进入。

保险库的具体特征是一个256字节的RSA-2048签名。plist将被塞进我们的OpenCore.efi。这个键可以在编译前插入[OpenCoreVault.c](https://github.com/acidanthera/OpenCorePkg/blob/master/Platform/OpenCore/OpenCoreVault.c)，如果你已经编译了OpenCore efi，也可以使用`sign.command`。

请注意，nvram plist不会被保险，因此使用模拟nvram的用户仍然有添加/删除某些nvram变量的风险

**设置你的config.plist**:

* `Misc -> Security -> Vault`:
  * `Basic`: 只需要vault.plist，主要用于文件系统完整性验证
  * `Secure`: 需要vault.plist和vault.sig，用于保险库的最佳安全性。Plist更改需要新的签名
* `Booter -> ProtectSecureBoot:` `YES`
  * Insyde固件需要修复安全启动密钥和报告违规行为

**设置升级保险**:

获取OpenCorePkg并打开`CreateVault`文件夹，在里面我们会找到以下内容:

* `create_vault.sh`
* `RsaTool`
* `sign.command`

最后一个是我们关心的: `sign.command`

所以当我们运行这个命令时，它会在我们的Utilities文件夹旁边查找EFI文件夹，所以我们需要将我们的个人EFI带到OpenCorePkg文件夹中，或者将Utilities带到我们的EFI文件夹中:

![](../../images/post-install/security-md/sign.png)

现在，我们准备运行`sign.command`:

![](../../images/post-install/security-md/sign-demo.png)

**在安装后禁用保险库**:

如果你正在进行繁重的故障排除或需要禁用保险库，需要更改的主要内容如下:

* 获取一个新的OpenCore.efi副本
* `Misc -> Security -> Vault` 设置为 Optional
* 删除 `vault.plist` 和 `vault.sig`
