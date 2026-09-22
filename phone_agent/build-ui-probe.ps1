param([Parameter(Mandatory=$true)][string]$NdkRoot)
$ErrorActionPreference = 'Stop'
$compiler = Join-Path $NdkRoot 'toolchains/llvm/prebuilt/windows-x86_64/bin/aarch64-linux-android26-clang.cmd'
New-Item -ItemType Directory -Force (Join-Path $PSScriptRoot 'bin') | Out-Null
& $compiler -O2 -Wall -Werror (Join-Path $PSScriptRoot 'ui-probe.c') -o (Join-Path $PSScriptRoot 'bin/ui-probe')
if ($LASTEXITCODE -ne 0) { throw 'ui-probe build failed' }
