#!/bin/bash

echo "🔍 GM60 QR Scanner UART Diagnostic Tool"
echo "======================================="
echo

echo "📋 System Information:"
echo "  OS: $(uname -a)"
echo "  Date: $(date)"
echo

echo "🔌 UART Configuration Check:"
echo "----------------------------"

# Check if UART is enabled in config
echo "1. Checking config files for UART settings:"

# Check both possible config locations (newer Pi OS uses /boot/firmware/)
CONFIG_FILES=("/boot/firmware/config.txt" "/boot/config.txt")
UART_ENABLED=false

for config_file in "${CONFIG_FILES[@]}"; do
    if [ -f "$config_file" ]; then
        echo "  Checking $config_file:"
        UART_LINES=$(grep -n "uart\|serial" "$config_file" 2>/dev/null)
        if [ -n "$UART_LINES" ]; then
            echo "$UART_LINES" | head -10 | sed 's/^/    /'
        fi

        if grep -q "enable_uart=1" "$config_file" 2>/dev/null; then
            echo "    ✅ enable_uart=1 found in $config_file"
            UART_ENABLED=true
        fi

        if grep -q "dtparam=uart0=on" "$config_file" 2>/dev/null; then
            echo "    ✅ dtparam=uart0=on found in $config_file"
        fi
    else
        echo "  $config_file: not found"
    fi
done

if [ "$UART_ENABLED" = true ]; then
    echo "  📋 UART is configured in config files"
    echo "  ⚠️  If devices still missing, you may need to reboot or check hardware"
else
    echo "  ⚠️  enable_uart=1 not found in any config file"
fi

echo

# Check for serial devices
echo "2. Available Serial Devices:"
echo "  /dev/serial* devices:"
ls -la /dev/serial* 2>/dev/null || echo "    ❌ No /dev/serial* devices found"

echo "  /dev/tty* devices (UART related):"
ls -la /dev/tty{AMA,S}* 2>/dev/null || echo "    ❌ No UART devices found"

echo

# Check permissions
echo "3. Permission Check:"
CURRENT_USER=$(whoami)
echo "  Current user: $CURRENT_USER"
echo "  Groups: $(groups $CURRENT_USER)"

if groups $CURRENT_USER | grep -q dialout; then
    echo "  ✅ User is in 'dialout' group"
else
    echo "  ⚠️  User NOT in 'dialout' group (run: sudo usermod -a -G dialout $USER)"
fi

echo

# Check what's using serial ports
echo "4. Process Check (what might be using serial ports):"
if command -v lsof >/dev/null; then
    echo "  Processes using serial devices:"
    lsof /dev/tty{AMA,S}* /dev/serial* 2>/dev/null || echo "    ✅ No processes currently using serial devices"
else
    echo "  lsof not available"
fi

echo

# Check dmesg for UART info
echo "5. Recent UART messages from kernel:"
dmesg | tail -20 | grep -i "uart\|serial\|tty" | tail -5

echo

echo "🔧 Recommendations:"
echo "=================="

if [ -c /dev/serial0 ]; then
    echo "✅ Use /dev/serial0 for your GM60 scanner (primary UART)"
elif [ -c /dev/ttyAMA0 ]; then
    echo "✅ Use /dev/ttyAMA0 for your GM60 scanner (primary UART)"
elif [ -c /dev/ttyS0 ]; then
    echo "⚠️  Only /dev/ttyS0 (mini UART) available - may not work reliably"
    echo "   Consider enabling primary UART with 'sudo raspi-config'"
else
    echo "❌ No UART devices found - check your Raspberry Pi configuration"
fi

echo
echo "📚 For GM60 setup help, see: GM60_SETUP_GUIDE.md"
echo "🔗 Raspberry Pi UART guide: https://www.raspberrypi.org/documentation/configuration/uart.md"