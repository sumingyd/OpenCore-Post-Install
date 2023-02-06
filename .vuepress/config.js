const {
    description
} = require('../package')

module.exports = {
    title: 'OpenCore 安装后',
    head: [
        ['meta', {
            name: 'theme-color',
            content: '#3eaf7c'
        }],
        ['meta', {
            name: 'apple-mobile-web-app-capable',
            content: 'yes'
        }],
        ['meta', {
            name: 'apple-mobile-web-app-status-bar-style',
            content: 'black'
        }],
        ["link", {
            rel: "'stylesheet",
            href: "/styles/website.css"
        },]
    ],
    base: '/OpenCore-Post-Install/',

    watch: {
        $page(newPage, oldPage) {
            if (newPage.key !== oldPage.key) {
                requestAnimationFrame(() => {
                    if (this.$route.hash) {
                        const element = document.getElementById(this.$route.hash.slice(1));

                        if (element && element.scrollIntoView) {
                            element.scrollIntoView();
                        }
                    }
                });
            }
        }
    },

    markdown: {
        extendMarkdown: md => {
            md.use(require('markdown-it-multimd-table'), {
                rowspan: true,
            });
        }
    },

    theme: 'vuepress-theme-succinct',
    globalUIComponents: [
        'ThemeManager'
    ],

    themeConfig: {
        repo: 'https://github.com/sumingyd/OpenCore-Post-Install',
        label: '简体中文',
        selectText: '选择语言',
        ariaLabel: '选择语言',
        editLinks: true,
        editLinkText: '在 GitHub 上编辑此页',
        lastUpdated: true,
        lastUpdated: '上次更新',
        logo: '/homepage.png',
        nav: [{
            text: '指南菜单',
            items: [
                {
                    text: 'OpenCore安装',
                    link: 'https://sumingyd.github.io/OpenCore-Install-Guide/'
                },
                {
                    text: 'OpenCore安装后',
                    link: 'https://sumingyd.github.io/OpenCore-Post-Install/'
                },
                {
                    text: 'OpenCore多重引导',
                    link: 'https://sumingyd.github.io/OpenCore-Multiboot/'
                },
                {
                    text: '开始使用ACPI',
                    link: 'https://sumingyd.github.io/Getting-Started-With-ACPI/'
                },
                {
                    text: '无线购买指南',
                    link: 'https://sumingyd.github.io/Wireless-Buyers-Guide/'
                },
                {
                    text: '显卡购买指南',
                    link: 'https://sumingyd.github.io/GPU-Buyers-Guide/'
                },
                {
                    text: '避免购买指南',
                    link: 'https://sumingyd.github.io/Anti-Hackintosh-Buyers-Guide/'
                },
            ]
        },],
        sidebar: [{
            title: '简介',
            collapsable: false,
            sidebarDepth: 1,
            children: [
                '',
            ]

        },
        {
            title: '通用',
            collapsable: false,
            sidebarDepth: 2,
            children: [

                ['/universal/audio', '修复音频'],
                ['/universal/oc2hdd', '无需USB启动'],
                ['/universal/update', '更新OpenCore, kexts和macOS'],
                ['/universal/drm', '修复 DRM'],
                ['/universal/iservices', '修复 iServices'],
                ['/universal/pm', '修复电源管理'],
                ['/universal/sleep', '修复睡眠'],
            ]
        },
        {
            title: 'USB 修复',
            collapsable: false,
            sidebarDepth: 1,
            children: [
                ['/usb/', 'USB Mapping: 简介'],
                ['/usb/system-preparation', '系统准备'],
                {
                    title: 'USB 映射',
                    collapsable: true,
                    sidebarDepth: 2,
                    children: [
                        ['/usb/intel-mapping/intel', 'Intel USB 映射'],
                        ['/usb/manual/manual', 'Manual 映射'],
                    ]
                },
                {
                    title: '杂项修复',
                    collapsable: true,
                    sidebarDepth: 1,
                    children: [
                        ['/usb/misc/power', '修复 USB 电源'],
                        ['/usb/misc/shutdown', '修复关机/重启'],
                        ['/usb/misc/instant-wake', '修复瞬间唤醒'],
                        ['/usb/misc/keyboard', '修复键盘唤醒问题'],
                    ]
                },
            ]
        },
        {
            title: '安全',
            collapsable: false,
            sidebarDepth: 2,
            children: [
                ['/universal/security', '安全性和文件库'],
                {
                    title: '',
                    collapsable: false,
                    sidebarDepth: 2,
                    children: [
                        ['/universal/security/filevault', '文件库'],
                        ['/universal/security/vault', '库'],
                        ['/universal/security/scanpolicy', '扫描策略'],
                        ['/universal/security/password', 'OpenCore菜单密码'],
                        ['/universal/security/applesecureboot', '苹果安全引导'],
                    ]
                },
            ]
        },
        {
            title: '笔记本电脑细节',
            collapsable: false,
            children: [
                ['/laptop-specific/battery', '修复电池读数'],

            ]
        },
        {
            title: '美化',
            collapsable: false,
            children: [
                ['/cosmetic/verbose', '修复分辨率和啰嗦模式'],
                ['/cosmetic/gui', '添加gui和开机铃声'],
                ['/universal/memory', '修复MacPro7,1内存错误'],
            ]
        },
        {
            title: '多引导',
            collapsable: false,
            children: [
                ['https://sumingyd.github.io/OpenCore-Multiboot/', 'OpenCore 多引导'],
                ['/multiboot/bootstrap', '设置启动选项'],
                ['/multiboot/bootcamp', '安装bootcamp'],
            ]
        },
        {
            title: '杂项',
            collapsable: false,
            children: [
                ['/misc/rtc', '修复 RTC'],
                ['/misc/msr-lock', '修复 CFG Lock'],
                ['/misc/nvram', '模拟 NVRAM'],
            ]
        },
        {
            title: 'GPU 修补',
            collapsable: false,
            children: [
                ['/gpu-patching/', '深入GPU修补'],
                {
                    title: '现代英特尔iGPU',
                    collapsable: false,
                    children: [
                        ['/gpu-patching/intel-patching/', 'iGPU补丁介绍'],
                        ['/gpu-patching/intel-patching/vram', 'VRAM 补丁'],
                        ['/gpu-patching/intel-patching/connector', 'Connector-type 补丁'],
                        ['/gpu-patching/intel-patching/busid', 'BusID 补丁'],
                    ]
                },
                {
                    title: '传统英特尔iGPU',
                    collapsable: false,
                    children: [
                        ['/gpu-patching/legacy-intel/', 'GMA 补丁'],
                    ]
                },
                {
                    title: '传统Nvidia',
                    collapsable: false,
                    children: [
                        ['/gpu-patching/nvidia-patching/', 'Nvidia 补丁'],
                    ]
                },
            ]
        },

        ],
    },
    plugins: [
        '@vuepress/back-to-top',
        'vuepress-plugin-smooth-scroll',
        'vuepress-plugin-fulltext-search',
        ['@vuepress/medium-zoom',
            {
                selector: ".theme-succinct-content :not(a) > img",
                options: {
                    background: 'var(--bodyBgColor)'
                }
            }],
    ]
}