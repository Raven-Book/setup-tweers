# Setup TweeRS

GitHub Action to download and setup [TweeRS](https://github.com/Raven-Book/TweeRS) CLI for building `.twee` files.

## Usage

```yaml
- uses: Raven-Book/setup-tweers@v1
```

### Pin a specific version

```yaml
- uses: Raven-Book/setup-tweers@v1
  with:
    version: "1.0.5"
```

### Full example

```yaml
name: Build
on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: Raven-Book/setup-tweers@v1
        id: tweers

      - run: tweers --version
```

## Inputs

| Name | Description | Default |
|------|-------------|---------|
| `version` | TweeRS version to install. Use `"latest"` for the newest release. | `latest` |
| `token` | GitHub token for API requests to avoid rate limits | `${{ github.token }}` |

## Outputs

| Name | Description |
|------|-------------|
| `version` | The installed TweeRS version |

## Supported Platforms

| OS | Architecture |
|----|-------------|
| Linux | x64, arm64 |
| macOS | x64, arm64 |
| Windows | x64 |
