# syntax=docker/dockerfile:1
# ^^^ Tells Docker to use BuildKit's Dockerfile frontend parser.
#     Must be the very first line. Enables advanced features like
#     cache mounts and heredocs, and ensures consistent parsing.

# Use a slim Debian base instead of a Bun image.
# Trixie is required because `nestjs-trpc` ships a native Linux binary that
# requires glibc 2.39 or newer; Debian bookworm only provides glibc 2.36.
# Vite+ installs and manages the project Bun runtime, so the devcontainer image
# should only provide the OS tools needed to run Vite+, Docker commands, Git,
# and an interactive shell.
FROM debian:trixie-slim

# User values are args so VS Code/devcontainer tooling can override them if
# needed. The defaults match the common non-root devcontainer user convention.
ARG USERNAME=ft_transcendence
ARG USER_UID=1000
ARG USER_GID=$USER_UID

# Use Bash for RUN commands so we can source files such as /etc/os-release.
# The final interactive shell is also Bash, configured below through
# devcontainer.json.
SHELL ["/bin/bash", "-lc"]

# Avoid interactive apt prompts during image build.
ENV DEBIAN_FRONTEND=noninteractive

# Install system-level dependencies in a single RUN layer.
# Combining all apt commands in one RUN reduces the number of layers,
# which makes the final image smaller and faster to pull.
#
# apt-get update   - refreshes the package index so apt knows what's available.
# apt-get install  - installs the listed packages.
# -y               - answers "yes" to prompts automatically.
# --no-install-recommends - skips optional recommended packages to keep the
#                           image lean.
#
# Packages:
#   bash            - interactive shell with normal history/keybindings.
#   ca-certificates - TLS root certificates for curl, git, and package repos.
#   curl            - downloads the Docker GPG key and Vite+ installer.
#   git             - version control and VS Code Git integration.
#   gnupg           - verifies the Docker apt repository signing key.
#   openssh-client  - SSH support for git remotes.
#   sudo            - lets the non-root user run admin commands when needed.
#
# rm -rf /var/lib/apt/lists/* deletes the apt package index cache after
# install. These files are only needed during the build; removing them shrinks
# the image.
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
      bash \
      ca-certificates \
      curl \
      git \
      gnupg \
      openssh-client \
      sudo \
    && rm -rf /var/lib/apt/lists/*

# Install the Docker CLI for Docker-outside-of-Docker (DooD).
# DooD means we mount the HOST's Docker socket (/var/run/docker.sock) into
# the container, so docker/compose commands inside the container actually
# talk to the host's Docker daemon. There is no nested Docker daemon here.
# We only install the CLI and compose plugin because the daemon runs on the host.
#
# Step by step:
#
# install -m 0755 -d /etc/apt/keyrings
#   Creates the keyring directory with permission 0755.
#
# curl ... | gpg --dearmor ...
#   Downloads Docker's GPG signing key and converts it to the binary format
#   expected by apt.
#
# chmod a+r /etc/apt/keyrings/docker.gpg
#   Makes the key readable by apt subprocesses.
#
# source /etc/os-release
#   Reads the Debian codename from the base image, such as "bookworm".
#
# echo "deb ..." > /etc/apt/sources.list.d/docker.list
#   Adds Docker's official apt repository for the current Debian release.
#
# docker-ce-cli and docker-compose-plugin
#   Provide the `docker` command and `docker compose` v2 command.
RUN install -m 0755 -d /etc/apt/keyrings \
    && curl -fsSL https://download.docker.com/linux/debian/gpg \
      | gpg --dearmor -o /etc/apt/keyrings/docker.gpg \
    && chmod a+r /etc/apt/keyrings/docker.gpg \
    && source /etc/os-release \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian ${VERSION_CODENAME} stable" \
      > /etc/apt/sources.list.d/docker.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends docker-ce-cli docker-compose-plugin \
    && rm -rf /var/lib/apt/lists/*

# Create the non-root devcontainer user.
# The explicit UID/GID keeps files written into the bind-mounted workspace owned
# by the expected host user. The docker group lets the user access the mounted
# Docker socket without sudo, and the sudoers entry keeps admin tasks available
# without prompting for a password in non-interactive setup commands.
RUN groupadd --gid "${USER_GID}" "${USERNAME}" \
    && useradd --uid "${USER_UID}" --gid "${USER_GID}" --create-home --shell /bin/bash "${USERNAME}" \
    && groupadd -f docker \
    && usermod -aG docker "${USERNAME}" \
    && echo "${USERNAME} ALL=(ALL) NOPASSWD:ALL" > "/etc/sudoers.d/${USERNAME}" \
    && chmod 0440 "/etc/sudoers.d/${USERNAME}"

# Switch to the non-root user for the Vite+ install.
# Vite+'s install script places the `vp` binary and managed runtimes under the
# current user's home directory. Installing it as the dev user keeps the command
# available in normal VS Code terminals.
USER ${USERNAME}

# Set the default working directory for subsequent commands and for terminals.
# /workspace is where devcontainer.json bind-mounts the repository.
WORKDIR /workspace

# Make `vp` available even before the shell startup files are sourced.
ENV PATH="/home/${USERNAME}/.vite-plus/bin:${PATH}"

# Install Vite+ via its official install script.
# Vite+ is responsible for installing and selecting the Bun version declared by
# the project, so this Dockerfile intentionally does not install Bun directly.
# The profile snippets make `vp` available in interactive login shells, which
# also gives VS Code terminals normal Bash behavior such as command history.
RUN curl -fsSL https://vite.plus | bash \
    && printf '\nsource "$HOME/.vite-plus/env"\n' >> "/home/${USERNAME}/.bashrc" \
    && printf '\nsource "$HOME/.vite-plus/env"\n' >> "/home/${USERNAME}/.profile"

# Keep the container alive for Dev Containers setup probes.
# VS Code terminals still open Bash through devcontainer.json; this command is
# only the background container process.
CMD ["sleep", "infinity"]
