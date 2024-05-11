import pickle
import csv


def read_csv_to_dict():
    area_dict = {}
    filename='bayareapincodes.csv'
    with open(filename, mode='r',encoding='utf-8-sig') as file:
        csv_reader = csv.DictReader(file)
        for row in csv_reader:
            area = row['Area']
            zip_code = row['ZipCodes']
            if area in area_dict:
                area_dict[area].append(zip_code)
            else:
                area_dict[area] = [zip_code]
    return area_dict

area_zip_dict = read_csv_to_dict()
print(area_zip_dict)

with open('./storage/pincode_dictionary.pkl', 'wb') as f:
    pickle.dump(area_zip_dict, f)