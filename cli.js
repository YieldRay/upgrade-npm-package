#!/usr/bin/env node

import { getPackageJSON, toLatestVersion, toUpdateVersion, packument } from "./dist/main.js";

const { dependencies, devDependencies, peerDependencies } = await getPackageJSON();

const allPackages = { ...dependencies, ...devDependencies, ...peerDependencies };

const allPackageNames = Object.keys(allPackages);

const packuMap = new Map();
for (const packageName of allPackageNames) {
    packuMap.set(packageName, await packument(packageName, "taobao"));
}

const printPack = (deps) => {
    Object.entries(deps).forEach(async ([packageName, versionRange]) => {
        const packu = packuMap.get(packageName);
        console.log(
            "%s %s %s %s",
            packageName.padEnd(25),
            versionRange.padEnd(10),
            toUpdateVersion(packu, versionRange).padEnd(10),
            toLatestVersion(packu).padEnd(10)
        );
    });
};

console.log("%s %s %s %s", "Package".padEnd(25), "Current".padEnd(10), "Wanted".padEnd(10), "Latest".padEnd(10));
printPack(dependencies);
printPack(devDependencies);
printPack(peerDependencies);

console.log("\n");
console.log("Use this command to update all packages:");
let command;
// npm i xxx@xxx
command = "npm i";
for (let packageName of Object.keys(dependencies))
    command += ` ${packageName}@${toUpdateVersion(packuMap.get(packageName), allPackages[packageName])}`;
console.log(command);
// npm i -D xxx@xxx
command = "npm i -D";
for (let packageName of Object.keys(devDependencies))
    command += ` ${packageName}@${toUpdateVersion(packuMap.get(packageName), allPackages[packageName])}`;
console.log(command);
