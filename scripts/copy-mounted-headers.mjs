import { copyFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const mount = process.argv[2];
if (mount !== 'blogs' && mount !== 'docs') {
	throw new Error(`Unsupported static asset mount: ${mount ?? '(missing)'}`);
}

const assetRoot = resolve('dist/client');
await copyFile(resolve(assetRoot, '_headers'), resolve(assetRoot, mount, '_headers'));
