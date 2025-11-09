# MindMate Monorepo Technical Setup Guide

This document provides a comprehensive guide for setting up and running the MindMate platform for local development.

## 1. Overview

Mindmate is an ai-centric tool for doctors to monitor the condition of Alzheimer's patients over time with input from different sources such as MRI scans, diagnoses, and patient conversations.

The high-level architecture consists of:
- **Two Frontends**: A `doctor-frontend` for clinicians and a `stellar-mind-companion` for patients.
- **A Core Backend**: A central API (`backend`) that manages data and orchestrates calls to specialized AI services.
- **AI/ML Microservices**: A suite of services for cognitive analysis from transcripts (`models`), MRI scan analysis (`mri_analysis_model`), and voice analysis (`voice_models`).
- **Central Database & Storage**: Supabase is used as the primary data and file storage.

## 2. Global Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js**: Version 20.x or higher.
- **npm** or **yarn**: For managing Node.js dependencies.
- **Python**: Version 3.11 or higher.
- **uv**: A fast Python package installer (`pip install uv`).
- **Docker**: For running the containerized MRI analysis model.
- **A Supabase Account**: You will need a free Supabase project.

## 3. Central Setup: Supabase

Most services depend on Supabase. Set it up first.

1.  **Create a Supabase Project**: Go to [supabase.com](https://supabase.com), create an account, and start a new project.
2.  **Get API Credentials**: In your project's dashboard, navigate to **Project Settings > API**. You will need the following:
    - **Project URL**
    - **`anon` public key**
    - **`service_role` secret key**
3.  **Run Schema SQL**: Navigate to the **SQL Editor** in your Supabase dashboard. Open and execute the contents of `stellar-mind-companion/supabase_schema.sql` to create the necessary tables and policies.
4.  **Create MRI Storage Bucket**: Navigate to **Storage** in the dashboard. Create a new private bucket named `mri_images`. This is required for the MRI upload feature in the `doctor-frontend`.

## 4. Component Setup & Execution

Follow the steps below for each component of the monorepo. It is recommended to run each command in a separate terminal window.

---

### 🧠 `backend` (Core API)

The central FastAPI service that connects frontends to the database and AI models.

-   **Environment Variables**: Create a `.env` file in the `backend/` directory:
    ```
    SUPABASE_URL="<YOUR_SUPABASE_URL>"
    SUPABASE_KEY="<YOUR_SUPABASE_SERVICE_ROLE_KEY>"
    ```
-   **Installation**:
    ```bash
    cd backend/
    uv sync
    ```
-   **Running**:
    ```bash
    uv run uvicorn NewMindmate.main:app --reload
    ```
    The API will be available at `http://127.0.0.1:8000`.

---

### 👨‍⚕️ `doctor-frontend` (Clinician Dashboard)

The Next.js application for doctors to monitor patients and analyze data.

-   **Environment Variables**: Create a `.env.local` file in the `doctor-frontend/` directory:
    ```
    SUPABASE_URL=<your-supabase-project-url>
    SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
    MRI_STORAGE_BUCKET=mri_images
    # Optional: Add a demo doctor UUID if needed for testing uploads
    # MRI_DEMO_DOCTOR_ID=<uuid-of-demo-doctor>
    ```
-   **Installation**:
    ```bash
    cd doctor-frontend/
    npm install
    ```
-   **Running**:
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:3000`.

---

### 🤖 `models` (Cognitive Analysis API)

A FastAPI microservice that uses LLMs to analyze call transcripts for cognitive insights.

-   **Environment Variables**: Create a `.env` file in the `models/` directory:
    ```
    # Required
    DEDALUS_API_KEY="dsk_live_xxxxx"          # Your Dedalus API key
    ANTHROPIC_API_KEY="sk-ant-xxxxx"          # Your Anthropic Claude key
    ```
-   **Installation**:
    ```bash
    cd models/
    pip install -r requirements.txt
    ```
-   **Running**:
    ```bash
    python api_server.py
    ```
    This service will run on port `8000` by default.

---

### 📱 `stellar-mind-companion` (Patient App)

The React + Vite application for patients.

-   **Environment Variables**: Create a `.env` file in the `stellar-mind-companion/` directory. The app has fallbacks, but it's best to be explicit.
    ```
    VITE_SUPABASE_URL="<YOUR_SUPABASE_URL>"
    VITE_SUPABASE_ANON_KEY="<YOUR_SUPABASE_ANON_KEY>"
    VITE_LIVEKIT_URL="<YOUR_LIVEKIT_WSS_URL>" # If you have a LiveKit instance
    ```
-   **Installation**:
    ```bash
    cd stellar-mind-companion/
    npm install
    ```
-   **Running**:
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173` (or another port if 5173 is busy).

---

### 🔬 `mri_analysis_model` (MRI Segmentation)

A Dockerized tool that uses AssemblyNet to segment and analyze T1 MRI scans. This is not a long-running service but a command-line tool.

-   **Installation**: Pull the Docker image.
    ```bash
    sudo docker pull volbrain/assemblynet:1.0.0
    ```
-   **Running**: Execute the container with a volume mount pointing to your MRI data.
    ```bash
    # Example for CPU processing
    sudo docker run --rm -v /path/to/your/mri_files:/data volbrain/assemblynet:1.0.0 /data/scan.nii.gz
    ```
    See the `mri_analysis_model/README.md` for more advanced usage, including GPU processing.

---

### 🎙️ `voice_models` (Dementia Detection from Voice)

A research-focused Python project for detecting dementia from voice recordings.

-   **Note**: This is not a runnable API service. It's a repository of code from a published study. To use it, you must supply your own voice data and adapt the data loading scripts (`data.py`, `select_task.py`).
-   **Installation**:
    ```bash
    cd voice_models/
    pip install -r requirements.txt
    ```
-   **Running**:
    ```bash
    python train.py -h
    ```
    This command shows the arguments for training a model with your own dataset.

## 5. Running the Full System (Development)

To have a functional local development environment, you need to run the core components:

1.  **Start the `backend` API.**
2.  **Start the `doctor-frontend` web app.**
3.  **Start the `stellar-mind-companion` web app.**
4.  **(Optional)** Start the `models` API if you need to test the AI transcript analysis.

The `mri_analysis_model` and `voice_models` are run on-demand and are not required to be running continuously for the core platform to function.

## 6. Project Structure

```
/
├── backend/                # Core FastAPI Backend
├── doctor-frontend/        # Next.js app for clinicians
├── models/                 # Python microservice for cognitive analysis
├── mri_analysis_model/     # Dockerized tool for MRI segmentation
├── stellar-mind-companion/ # React + Vite app for patients
└── voice_models/           # Python project for voice-based dementia detection
```
