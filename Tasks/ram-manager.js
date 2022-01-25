import { formatMoney, formatRam, getFilePath, readFloat } from './helpers.js'

const max_spend_ratio = 0.1; // Don't spend more than this proportion of money

/** @param {NS} ns **/
export async function main(ns) {
    const reserve = readFloat('reserve.txt');
    const money = ns.getServerMoneyAvailable("home");
    const spendable = Math.min(money - reserve, money * max_spend_ratio);
    const cost = ns.getUpgradeHomeRamCost();
    const currentRam = ns.getServerMaxRam("home");
    if (currentRam >= 1048576) // 2 ** 20 = 1048576
        return ns.print(`We're at max home RAM (2^20 = ${formatRam(currentRam)})`);
    const nextRam = currentRam * 2;
    const upgradeDesc = `home RAM from ${formatRam(currentRam)} to ${formatRam(nextRam)}`;
    if (spendable < cost)
        return ns.print(`Money we're allowed to spend (${formatMoney(spendable)}) is less than the cost (${formatMoney(cost)}) to upgrade ${upgradeDesc}`);
    if (ns.upgradeHomeRam()) {
        announce(ns, `SUCCESS: Upgraded ${upgradeDesc}`, 'success');
        if (nextRam != ns.getServerMaxRam("home"))
            announce(ns, `WARNING: Expected to upgrade ${upgradeDesc}, but new home ram is ${formatRam(ns.getServerMaxRam("home"))}`, 'warning');
    } else {
        announce(ns, `ERROR: Failed to upgrade ${upgradeDesc} thinking we could afford it (cost: ${formatMoney(cost)} cash: ${formatMoney(money)} budget: ${formatMoney(spendable)})`, 'error');
    }
}

function announce(ns, message, toastStyle) {
    ns.print(message);
    ns.tprint(message);
    if (toastStyle) ns.toast(message, toastStyle);
}