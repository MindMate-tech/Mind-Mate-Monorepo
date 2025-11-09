#!/bin/bash
# Automated setup script for EC2 instance
# Run this script on a fresh Ubuntu EC2 instance

set -e

echo "=========================================="
echo "MindMate.tech MRI Analysis - EC2 Setup Script"
echo "Built at Hack Princeton by Students"
echo "=========================================="

# Update system
echo "Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install Docker
echo "Installing Docker..."
sudo apt-get install -y apt-transport-https ca-certificates curl gnupg-agent software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io

# Add user to docker group
echo "Adding user to docker group..."
sudo usermod -aG docker $USER

# Install AWS CLI (optional but useful)
echo "Installing AWS CLI..."
# For newer Ubuntu versions, use snap or pip
if command -v snap &> /dev/null; then
    sudo snap install aws-cli --classic
else
    # Fallback to pip installation
    sudo apt-get install -y python3-pip
    pip3 install awscli --user
fi

# Create data directories
echo "Creating data directories..."
mkdir -p ~/mri_data/input
mkdir -p ~/mri_data/output
chmod 755 ~/mri_data

# Check for GPU
if command -v nvidia-smi &> /dev/null; then
    echo "GPU detected! Installing NVIDIA Container Toolkit..."
    
    distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
    curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
    curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | sudo tee /etc/apt/sources.list.d/nvidia-docker.list
    
    sudo apt-get update
    sudo apt-get install -y nvidia-docker2
    sudo systemctl restart docker
    
    echo "Verifying GPU access..."
    sudo docker run --rm --gpus all nvidia/cuda:11.0-base nvidia-smi
else
    echo "No GPU detected, proceeding with CPU-only setup"
fi

# Verify Docker installation
echo "Verifying Docker installation..."
sudo docker run hello-world

# Pull AssemblyNet image
echo "Pulling AssemblyNet Docker image (this may take 10-15 minutes)..."
sudo docker pull volbrain/assemblynet:1.0.0

echo ""
echo "=========================================="
echo "MindMate.tech MRI Analysis - Setup Complete!"
echo "=========================================="
echo ""
echo "IMPORTANT: You need to log out and log back in for docker group changes to take effect."
echo ""
echo "Next steps:"
echo "1. Log out: exit"
echo "2. Log back in"
echo "3. Test with: sudo docker images | grep assemblynet"
echo "4. Run MindMate.tech MRI Analysis: ./ec2_run_assemblynet.sh your_file.nii.gz"
echo ""
echo "For more information, see README.md"
echo ""

