const VERSION_REGEX = /(@version\s+)(\d+\.\d+\.\d+)/;

export function readVersion(contents) {
  const match = contents.match(VERSION_REGEX);
  if (!match) throw new Error("No @version found in user.js");
  return match[2];
}

export function writeVersion(contents, version) {
  const updated = contents.replace(VERSION_REGEX, `$1${version}`).trimEnd();
  return `${updated}\n`;
}
