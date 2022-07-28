import { Packument, PackageJson, PackageLock } from "@npm/types";
import fetch from "node-fetch";
import fs from "fs/promises";
import semverSatisfies from "semver/functions/satisfies.js";
import semverRsort from "semver/functions/rsort.js";

// types from https://www.npmjs.com/package/@npm/types

// https://registry.npmmirror.com/<package-name>
// https://registry.npmmirror.com/<package-name>/<version>
// https://registry.npmmirror.com/<package-name>/-/<package-name>-<version>.tgz

export const registriesMap = {
    npm: "https://registry.npmjs.org/",
    yarn: "https://registry.yarnpkg.com/",
    tencent: "https://mirrors.cloud.tencent.com/npm/",
    cnpm: "https://r.cnpmjs.org/",
    taobao: "https://registry.npmmirror.com/",
    npmMirror: "https://skimdb.npmjs.com/registry/",
};

export async function packument(packageName: string, registryName = "npm"): Promise<Packument> {
    const registry = (registriesMap as { [k: string]: string })[registryName];
    if (!registry) throw new Error("Unknown Registery Name");
    const res = await fetch(`${registry}${packageName}`);
    return (await res.json()) as Packument;
}

export async function packageJSON(packageName: string, version: string, registryName = "npm"): Promise<PackageJson> {
    const registry = (registriesMap as { [k: string]: string })[registryName];
    if (!registry) throw new Error("Unknown Registery Name");
    const res = await fetch(`${registry}${packageName}/${version}`);
    return (await res.json()) as PackageJson;
}

export function gzURL(packageName: string, version: string, registryName = "npm"): string {
    const registry = (registriesMap as { [k: string]: string })[registryName];
    if (!registry) throw new Error("Unknown Registery Name");
    return `${registry}${packageName}/-/${packageName.split("/").reverse()[0]}-${version}.tgz`;
}

export async function getPackageJSON(pathOrFolder = "./"): Promise<PackageJson> {
    const filePath = pathOrFolder.endsWith("/") ? pathOrFolder + "package.json" : pathOrFolder;
    const json = await fs.readFile(filePath, { encoding: "utf8" });
    return JSON.parse(json) as PackageJson;
}

export async function getPackageLock(pathOrFolder = "./"): Promise<PackageLock> {
    const filePath = pathOrFolder.endsWith("/") ? pathOrFolder + "package-lock.json" : pathOrFolder;
    const json = await fs.readFile(filePath, { encoding: "utf8" });
    return JSON.parse(json) as PackageLock;
}

export const toLatestVersion = (pack: Packument) => pack["dist-tags"]["latest"];

const updateVersion = (versionRange: string, availableVersions: Array<string>) =>
    semverRsort(availableVersions.filter((v) => semverSatisfies(v, versionRange)))[0];

export const toUpdateVersion = (pack: Packument, versionRange: string) =>
    updateVersion(versionRange, Object.keys(pack.versions));

// const vue = await packument("vue", "taobao");
// console.log(await packageJSON("vue", "2.7.8", "taobao"));
// console.log(gzURL("vue", "2.7.8", "taobao"));
// console.log(toLatestVersion(vue));
// console.log(toUpdateVersion(vue, "^2.0.0"));
