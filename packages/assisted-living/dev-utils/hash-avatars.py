
import json
import os
import hashlib
import secrets

def hash_and_rename():
    # Generate a random secret
    secret = secrets.token_hex(16)
    with open("avatar-secret.txt", "w") as secret_file:
        secret_file.write(secret)

    # Paths
    data_file_path = os.path.join(os.path.dirname(__file__), '''../demo-data/residents/data.json''')
    avatars_dir = os.path.join(os.path.dirname(__file__), '''../public/avatars''')

    # Read the JSON data
    with open(data_file_path, "r") as f:
        residents = json.load(f)

    # Process each resident
    for resident in residents:
        if "avatar_url" in resident["data"]:
            avatar_url = resident["data"]["avatar_url"]
            if avatar_url:
                original_filename = os.path.basename(avatar_url)
                
                # Create a hash of the filename
                hasher = hashlib.sha256()
                hasher.update(secret.encode('utf-8'))
                hasher.update(original_filename.encode('utf-8'))
                hashed_filename = hasher.hexdigest() + ".png"

                # Rename the file
                original_filepath = os.path.join(avatars_dir, original_filename)
                hashed_filepath = os.path.join(avatars_dir, hashed_filename)

                if os.path.exists(original_filepath):
                    os.rename(original_filepath, hashed_filepath)

                # Update the avatar_url
                resident["data"]["avatar_url"] = f"/avatars/{hashed_filename}"

    # Write the updated data back to the file
    with open(data_file_path, "w") as f:
        json.dump(residents, f, indent=2)

if __name__ == "__main__":
    hash_and_rename()
