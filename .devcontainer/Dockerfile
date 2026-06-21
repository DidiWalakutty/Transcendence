# syntax=docker/dockerfile:1
# ^^^ Tells Docker to use BuildKit's Dockerfile frontend parser.
#     Must be the very first line. Enables advanced features like
#     cache mounts and heredocs, and ensures consistent parsing.

# Use the official Bun image based on Debian as our base.
# 'oven/bun' is the official Bun Docker image maintained by the Bun team.
# '1-debian' means: latest Bun v1.x on a Debian base (as opposed to Alpine).
# We pick Debian because the Docker apt repository only supports it officially,
# and it's more compatible with native addons than Alpine's musl libc.
FROM oven/bun:1-debian

# Install system-level dependencies in a single RUN layer.
# Combining all apt commands in one RUN reduces the number of image layers,
# which makes the final image smaller and faster to pull.
#
# apt-get update   — refreshes the package index so apt knows what's available
# apt-get install  — installs the listed packages
# -y               — answers "yes" to all prompts automatically (non-interactive)
# --no-install-recommends — skips optional recommended packages to keep image lean
#
# Packages:
#   curl        — used to download the Docker GPG key and Vite+ install script
#   git         — version control, required by many dev tools and VS Code features
#   unzip       — needed to extract some downloaded archives
#   ca-certificates — TLS root certificates so curl/apt can verify HTTPS connections
#   gnupg       — GPG tooling used to verify the Docker apt repository signature
#   lsb-release — provides lsb_release command, used to detect the Debian codename
#   sudo        — allows the non-root 'bun' user to run commands as root when needed
#
# rm -rf /var/lib/apt/lists/* — deletes the apt package index cache after install.
# These files are only needed during the build; removing them shrinks the image.
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    git \
    unzip \
    ca-certificates \
    gnupg \
    lsb-release \
    sudo \
    && rm -rf /var/lib/apt/lists/*

# Grant the 'bun' user passwordless sudo access.
# The oven/bun base image already ships with a non-root user called 'bun'
# at UID/GID 1000. We reuse it instead of creating our own (which would
# conflict since GID 1000 is already taken).
# >> appends to /etc/sudoers rather than overwriting it.
# NOPASSWD:ALL means any sudo command runs without prompting for a password,
# which is necessary for non-interactive container scripts.
RUN echo "bun ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

# Install the Docker CLI for Docker-outside-of-Docker (DooD).
# DooD means we mount the HOST's Docker socket (/var/run/docker.sock) into
# the container, so docker/compose commands inside the container actually
# talk to the host's Docker daemon — no nested Docker daemon needed.
# We only install the CLI (not the full engine) because the daemon runs on
# the host. The compose plugin gives us 'docker compose' (v2) syntax.
#
# Step by step:
#
# install -m 0755 -d /etc/apt/keyrings
#   Creates the /etc/apt/keyrings directory with permission 0755.
#   This is where apt stores trusted GPG keys for third-party repositories.
#   -m 0755 sets the directory permissions
#   -d      creates the directory (like mkdir -p)
#
# curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor ...
#   Downloads Docker's GPG signing key and converts it from ASCII-armored
#   format to binary (.gpg) format that apt understands.
#   -f  fail silently on HTTP errors
#   -s  silent mode (no progress bar)
#   -S  show errors even in silent mode
#   -L  follow redirects
#
# chmod a+r /etc/apt/keyrings/docker.gpg
#   Makes the key file readable by all users (apt runs as root but
#   some subprocesses may need read access too).
#
# echo "deb [arch=... signed-by=...] ..." > /etc/apt/sources.list.d/docker.list
#   Adds Docker's apt repository to the system.
#   arch=$(dpkg --print-architecture) — detects the CPU arch (e.g. amd64, arm64)
#   $(lsb_release -cs) — detects the Debian codename (e.g. bookworm, trixie)
#   signed-by= — tells apt to verify packages against our downloaded GPG key
#
# groupadd -f docker
#   Creates the 'docker' group. The -f flag means "succeed silently if the
#   group already exists" (idempotent). Installing docker-ce-cli alone does NOT
#   create this group — only the full docker-ce engine does. We need it so
#   we can add the 'bun' user to it.
#
# usermod -aG docker bun
#   Adds 'bun' to the 'docker' group so it can use the Docker socket
#   without sudo. -a means "append" (don't remove from other groups),
#   -G specifies the group to add to.
RUN install -m 0755 -d /etc/apt/keyrings \
    && curl -fsSL https://download.docker.com/linux/debian/gpg \
       | gpg --dearmor -o /etc/apt/keyrings/docker.gpg \
    && chmod a+r /etc/apt/keyrings/docker.gpg \
    && echo \
       "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
       https://download.docker.com/linux/debian $(lsb_release -cs) stable" \
       > /etc/apt/sources.list.d/docker.list \
    && apt-get update && apt-get install -y --no-install-recommends \
       docker-ce-cli \
       docker-compose-plugin \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd -f docker \
    && usermod -aG docker bun

# Switch to the non-root 'bun' user for the Vite+ install.
# Vite+'s install script drops the 'vp' binary into the user's local bin
# directory (~/.local/bin or similar). If we ran it as root, 'vp' would
# land in root's home and be unavailable to the 'bun' user at runtime.
USER bun

# Install Vite+ via its official install script.
# Vite+ is not published to npm — it's distributed via a curl install script
# hosted at https://vite.plus, similar to how Bun, Deno, and Rust are installed.
# The script detects the OS/arch and places the 'vp' binary in the user's PATH.
RUN curl -fsSL https://vite.plus | bash

# Set the default working directory for any subsequent RUN, CMD, ENTRYPOINT,
# COPY, and ADD instructions, and for the shell when VS Code connects.
# /workspace is where devcontainer.json mounts the project from the host.
WORKDIR /workspace