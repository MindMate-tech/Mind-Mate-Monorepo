# MindMate.tech - EC2 Setup Guide for MRI Analysis

This guide will help you set up an Amazon EC2 instance to run MindMate.tech's MRI analysis module, which utilizes AssemblyNet for whole brain segmentation.

## Prerequisites

- AWS Account
- AWS CLI installed (optional, but helpful)
- SSH key pair for EC2 access

## Step 1: Launch EC2 Instance

### Instance Requirements

**For CPU-only processing:**
- **Minimum**: `t3.medium` (2 vCPUs, 4GB RAM) - may be slow, ~$0.04/hour
- **Recommended**: `m7.large` or `t3.large` (2 vCPUs, 8GB RAM) - good balance, ~$0.08-0.10/hour
- **Better Performance**: `t3.xlarge` (4 vCPUs, 16GB RAM) - faster processing, ~$0.17/hour
- **Minimum Requirements**: 6GB RAM, x86_64 architecture
- **Storage**: 50GB+ EBS volume (for Docker image ~10GB + data)

**For GPU processing (faster):**
- Instance Type: `g4dn.xlarge` or larger (NVIDIA T4 GPU, 8GB+ VRAM)
- NVIDIA GPU with CUDA Compute capability >= 6.0
- Storage: 50GB+ EBS volume

### Launch Steps

1. **Go to EC2 Console**: https://console.aws.amazon.com/ec2/
2. **Click "Launch Instance"**
3. **Configure Instance**:
   - **Name**: `mindmate-mri-processor`
   - **AMI**: Choose **Ubuntu 22.04 LTS** (x86_64)
   - **Instance Type**: 
     - **Budget CPU**: `t3.medium` (2 vCPU, 4 GB RAM) - minimum, may be slow
     - **Recommended CPU**: `m7.large` or `t3.large` (2 vCPU, 8 GB RAM) - good balance
     - **Better CPU**: `t3.xlarge` (4 vCPU, 16 GB RAM) - faster processing
     - **GPU**: `g4dn.xlarge` (4 vCPU, 16 GB RAM, NVIDIA T4 GPU) - fastest option
   - **Key Pair**: Select or create a new key pair (save the `.pem` file!)
   - **Network Settings**: 
     - Allow SSH (port 22) from your IP
     - For web access, allow HTTP/HTTPS if needed
   - **Storage**: 
     - Root volume: 50 GB (gp3)
     - Add additional volume if needed for data storage
4. **Launch Instance**

## Step 2: Connect to EC2 Instance

```bash
# Make your key file executable
chmod 400 /path/to/your-key.pem

# Connect to instance
ssh -i /path/to/your-key.pem ubuntu@<EC2_PUBLIC_IP>
```

Replace:
- `/path/to/your-key.pem` with your actual key file path
- `<EC2_PUBLIC_IP>` with your instance's public IP (found in EC2 console)

## Step 3: Install Docker on EC2

Once connected to your EC2 instance, you can either:

**Option A: Use the automated setup script (recommended)**
```bash
# Upload the setup script to EC2
scp -i your-key.pem ec2_setup_script.sh ubuntu@<EC2_IP>:~/

# On EC2, make it executable and run
chmod +x ec2_setup_script.sh
./ec2_setup_script.sh
```

**Option B: Manual installation**

Run these commands manually:

```bash
# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Install Docker
sudo apt-get install -y apt-transport-https ca-certificates curl gnupg-agent software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io

# Add current user to docker group (to run without sudo)
sudo usermod -aG docker ubuntu

# Verify Docker installation
sudo docker run hello-world

# Log out and log back in for group changes to take effect
exit
```

Reconnect to your instance:
```bash
ssh -i /path/to/your-key.pem ubuntu@<EC2_PUBLIC_IP>
```

## Step 4: Install NVIDIA Container Toolkit (GPU instances only)

If you're using a GPU instance (g4dn, p3, etc.):

```bash
# Install NVIDIA drivers and container toolkit
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | sudo tee /etc/apt/sources.list.d/nvidia-docker.list

sudo apt-get update
sudo apt-get install -y nvidia-docker2
sudo systemctl restart docker

# Verify GPU access
sudo docker run --rm --gpus all nvidia/cuda:11.0-base nvidia-smi
```

## Step 5: Pull AssemblyNet Docker Image

```bash
# Pull the AssemblyNet image (this will take several minutes, ~10GB download)
sudo docker pull volbrain/assemblynet:1.0.0

# Verify image is downloaded
sudo docker images | grep assemblynet
```

## Step 6: Prepare Data Directory

```bash
# Create directories for input and output
mkdir -p ~/mri_data/input
mkdir -p ~/mri_data/output

# Set permissions
chmod 755 ~/mri_data
```

## Step 7: Upload MRI Files to EC2

### Option A: Using SCP (from your local machine)

```bash
# Upload a single file
scp -i /path/to/your-key.pem /path/to/local/mri_file.nii.gz ubuntu@<EC2_PUBLIC_IP>:~/mri_data/input/

# Upload entire directory
scp -i /path/to/your-key.pem -r /path/to/local/mri_directory/* ubuntu@<EC2_PUBLIC_IP>:~/mri_data/input/
```

### Option B: Using AWS S3 (recommended for large files)

```bash
# On EC2, install AWS CLI
sudo apt-get install -y awscli

# Configure AWS credentials (if not already configured)
aws configure

# Download from S3
aws s3 cp s3://your-bucket/mri-files/ ~/mri_data/input/ --recursive
```

## Step 8: Run MindMate.tech MRI Analysis

### CPU Processing

```bash
# Process a single MRI file
sudo docker run --rm \
  -v ~/mri_data/input:/data \
  -v ~/mri_data/output:/data_out \
  volbrain/assemblynet:1.0.0 \
  /data/your_mri_file.nii.gz /data_out

# Process with age and sex (for normative bounds in report)
sudo docker run --rm \
  -v ~/mri_data/input:/data \
  -v ~/mri_data/output:/data_out \
  volbrain/assemblynet:1.0.0 \
  -age 50 -sex Male \
  /data/your_mri_file.nii.gz /data_out
```

### GPU Processing (faster)

```bash
# Process a single MRI file on GPU
sudo docker run --rm --gpus '"device=0"' \
  -v ~/mri_data/input:/data \
  -v ~/mri_data/output:/data_out \
  volbrain/assemblynet:1.0.0 \
  /data/your_mri_file.nii.gz /data_out
```

### Using MindMate.tech Helper Script

```bash
# Easy processing with the helper script
./ec2_run_assemblynet.sh your_file.nii.gz 50 Male

# Or process multiple files
sudo docker run --rm \
  -v ~/mri_data/input:/data \
  -v ~/mri_data/output:/data_out \
  volbrain/assemblynet:1.0.0 \
  -recursive -pattern-t1 "*.nii.gz" \
  -global-csv /data_out/global_volumetry_info.csv \
  /data /data_out
```

## Step 9: Download Results

### Using SCP

```bash
# Download results to local machine
scp -i /path/to/your-key.pem -r ubuntu@<EC2_PUBLIC_IP>:~/mri_data/output/* /local/output/path/
```

### Using S3

```bash
# Upload results to S3
aws s3 cp ~/mri_data/output/ s3://your-bucket/results/ --recursive
```

## Step 10: Clean Up (Important for Cost Management)

```bash
# Stop instance when not in use (to save costs)
# In EC2 Console: Instance Actions > Instance State > Stop

# Or terminate if you're done
# In EC2 Console: Instance Actions > Instance State > Terminate
```

## Cost Optimization Tips

1. **Use Spot Instances**: Can save up to 90% (but can be interrupted)
2. **Stop Instance**: Stop when not in use (you only pay for storage)
3. **Use Smaller Instance**: Start with `t3.large` for testing
4. **Monitor Costs**: Set up billing alerts in AWS

## Processing Time Estimates

- **CPU (t3.xlarge)**: ~15-20 minutes per image
- **GPU (g4dn.xlarge)**: ~7-10 minutes per image

## Troubleshooting

### Docker permission denied
```bash
# Make sure you're in docker group
groups
# If not, add yourself and reconnect
sudo usermod -aG docker ubuntu
exit
# Reconnect
```

### Out of disk space
```bash
# Check disk usage
df -h
# Clean up Docker
sudo docker system prune -a
```

### GPU not detected
```bash
# Check NVIDIA driver
nvidia-smi
# Restart Docker
sudo systemctl restart docker
```

## Integration with MindMate.tech Platform

This EC2 setup is part of the MindMate.tech healthcare platform, built at Hack Princeton by students. The MRI analysis results can be integrated with:

- MindMate.tech API endpoints
- Patient dashboard systems
- Longitudinal tracking systems
- Automated alert systems

For API integration examples, see the main MindMate.tech repository.

## About MindMate.tech

**MindMate.tech** is a comprehensive healthcare technology platform that combines:
- MRI brain analysis (this module)
- Voice-based cognitive assessment
- Patient monitoring and dashboards
- AI-powered healthcare insights

Built at Hack Princeton by students, MindMate.tech aims to provide accessible, advanced healthcare technology solutions.

