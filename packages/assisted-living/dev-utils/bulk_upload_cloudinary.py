import cloudinary
import cloudinary.uploader
import os

def bulk_upload_to_cloudinary(local_folder_path, cloudinary_folder_path):
    """
    Uploads all files from a local folder to a specified Cloudinary folder.

    Args:
        local_folder_path (str): The path to the local folder containing files to upload.
        cloudinary_folder_path (str): The target folder path in Cloudinary.
    """
    # Configure Cloudinary (replace with your actual cloud name, API key, and API secret)
    # It's recommended to set these as environment variables for security.
    # For example:
    # export CLOUDINARY_CLOUD_NAME="your_cloud_name"
    # export CLOUDINARY_API_KEY="your_api_key"
    # export CLOUDINARY_API_SECRET="your_api_secret"
    cloudinary.config(
        cloud_name=os.environ.get('CLOUDINARY_CLOUD_NAME'),
        api_key=os.environ.get('CLOUDINARY_API_KEY'),
        api_secret=os.environ.get('CLOUDINARY_API_SECRET')
    )

    if not cloudinary.config().cloud_name or not cloudinary.config().api_key or not cloudinary.config().api_secret:
        print("Cloudinary API credentials are not set. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.")
        return

    if not os.path.isdir(local_folder_path):
        print(f"Error: Local folder '{local_folder_path}' does not exist.")
        return

    print(f"Starting bulk upload from '{local_folder_path}' to Cloudinary folder '{cloudinary_folder_path}'...")

    uploaded_count = 0
    failed_uploads = []

    for root, _, files in os.walk(local_folder_path):
        for filename in files:
            local_file_path = os.path.join(root, filename)
            
            # Construct the public_id for Cloudinary
            # This will create a public_id like "cloudinary_folder_path/subfolder/filename_without_extension"
            relative_path = os.path.relpath(local_file_path, local_folder_path)
            public_id_base = os.path.splitext(relative_path)[0]
            
            # Replace backslashes with forward slashes for Cloudinary public_id
            public_id_base = public_id_base.replace(os.sep, '/')

            # Combine with the target Cloudinary folder path
            full_public_id = f"{cloudinary_folder_path}/{public_id_base}"

            try:
                print(f"Uploading {local_file_path} to {full_public_id}...")
                response = cloudinary.uploader.upload(
                    local_file_path,
                    folder=cloudinary_folder_path,
                    public_id=public_id_base, # Use public_id_base for the actual public_id within the folder
                    resource_type="auto" # Automatically detect resource type (image, video, raw)
                )
                uploaded_count += 1
                print(f"Successfully uploaded {filename}. URL: {response['secure_url']}")
            except Exception as e:
                failed_uploads.append(f"{local_file_path}: {e}")
                print(f"Failed to upload {filename}: {e}")

    print("\n--- Upload Summary ---")
    print(f"Total files processed: {uploaded_count + len(failed_uploads)}")
    print(f"Successfully uploaded: {uploaded_count}")
    if failed_uploads:
        print(f"Failed uploads: {len(failed_uploads)}")
        for failure in failed_uploads:
            print(f"- {failure}")
    else:
        print("All files uploaded successfully!")

if __name__ == "__main__":
    # Example usage:
    # Replace with your actual local folder path and desired Cloudinary folder
    local_folder = "/home/darealestninja/dev-projects/lean-ehr/packages/assisted-living/public/avatars"
    cloudinary_target_folder = "lean-ehr/assisted-living/avatars"

    bulk_upload_to_cloudinary(local_folder, cloudinary_target_folder)
