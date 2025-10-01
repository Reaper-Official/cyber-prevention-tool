# Renommez le fichier
mv backend/prisma/training-modules.js backend/prisma/training-modules.ts

# Modifiez l'import dans seed.ts
sed -i "s/from '.\/training-modules.js'/from '.\/training-modules'/" backend/prisma/seed.ts