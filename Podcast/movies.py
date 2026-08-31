import requests
from pprint import pprint

movies_list = [{'id': 11814, 'title': 'Weird Science'},
 {'id': 8012, 'title': 'Get Shorty'},
 {'id': 2756, 'title': 'The Abyss'},
 {'id': 2616, 'title': 'Uncle Buck'},
 {'id': 184, 'title': 'Jackie Brown'},
 {'id': 2322, 'title': 'Sneakers'},
 {'id': 11543, 'title': 'Kingpin'},
 {'id': 15196, 'title': 'Clue'},
 {'id': 6071, 'title': 'Kiss of Death'},
 {'id': 18, 'title': 'The Fifth Element'},
 {'id': 14181, 'title': 'Boiler Room'}]

 #{'id': 402, 'title': 'Basic Instinct'}
 #, {'id': 9326, 'title': 'Romancing the Stone' }
 #]

all_casts = []


API_KEY = "7a048a200028269b38f91c84becdd599"
title_search_url = "https://api.themoviedb.org/3/search/movie"


def movie_search_list_build():
    global title_search_url, movies_list
    movie_name = ""
    while movie_name != "quit!":
        movie_name = input("Enter a movie name (or 'quit!')': ")
        params = {"api_key": API_KEY, "query": movie_name}
        data = requests.get(title_search_url, params=params).json()
        pprint(data)
        for m in data["results"]:
            pprint(m)
            print(f"{m['title']} {m['release_date']} - {m["id"]}")

        if movie_name =="quit!":
            break

        movie_id = input("Enter a movie id: (or 'skip')")
        if movie_id != "skip":
            movie_t = next((m for m in data["results"] if m["id"] == int(movie_id)), None)
            if movie_t:
                print("You selected:", movie_id, "-", movie_t["title"])
                movies_list.append({"id":int(movie_id), 'title':movie_t["title"]})
            else:
                print("Movie not found.")



    pprint(movies_list)




def get_cast(movie_id):
#    search_url = "https://api.themoviedb.org/3/search/movie"
#   params = {"api_key": API_KEY, "query": movie_name}
#
#    data = requests.get(search_url, params=params).json()
#    movie_id = data["results"][0]["id"]

    credits_url = f"https://api.themoviedb.org/3/movie/{movie_id}/credits"
    credits = requests.get(credits_url, params={"api_key": API_KEY}).json()

    return credits['cast']
    return {actor["name"] for actor in credits["cast"]}


def get_actor_details(person_id):
    #person_id = 6384

    url = f"https://api.themoviedb.org/3/person/{person_id}"

    person = requests.get(url, params={"api_key": API_KEY}).json()

    #from pprint import pprint
    #pprint(person)
    return person



def get_cast_search_url(m_id):
    return f"https://api.themoviedb.org/3/movie/{m_id}/credits"

def has_chicago_connections(person_obj):
    keywords = ["chicago", "evanston", "oak park", "illinois","northwestern","second city"]

    birthplace = (person_obj.get("place_of_birth") or "").lower()
    bio = (person_obj.get("biography") or "").lower()
    person_obj['bio_snippet'] = ""
    if not person_obj['birthday']:
        person_obj['birthday']=""

    if any(b in birthplace for b in keywords):
        person_obj['bio_snippet'] = extract_context(bio, keywords, 30)
        return True

    if any(b in bio for b in keywords):
        person_obj['bio_snippet'] = extract_context(bio, keywords, 30)
        return True

    return False

import re

def extract_context(text, keywords, window=30):
    pattern = r".{0," + str(window) + r"}(" + "|".join(keywords) + r").{0," + str(window) + r"}"
    
    match = re.search(pattern, text, re.IGNORECASE)

    if match:
        return match.group(0)

    return "None"

def print_chicago_connections():
    print("----Finding Chicago Connections-----")
    for m in all_casts:
        print(f"\n--------{m["title"]} | Total cast: {len(m['cast'])}--------")
        num_chi_actors = 0
        for a in m["cast"]:

            #print(f"{a['name']} - {a['id']}")
            p = get_actor_details(a['id'])
            
            if(has_chicago_connections(p)):
                num_chi_actors += 1
                print(f"{num_chi_actors}. {p['name']:20s} {'('+str(p['id'])+')':10s}\n\tborn: {p['place_of_birth']:30s} {p['birthday']:11s} - Bio snippet: {p['bio_snippet']}")
            #
            #print(f"\t{p['place_of_birth']}")

def print_common_casts():
    print("----Finding Common Cast Members-----")
    common_count = 0

    for i in range(len(all_casts)):
        cast1 = {a["name"] for a in all_casts[i]["cast"]} # make a dictionary of actor names

        for j in range(i+1,len(all_casts)):
            cast2 = {a["name"] for a in all_casts[j]["cast"]} # make a dictionary of actor names
            
            common_cast = cast1 & cast2
            if common_cast:
                common_count+=1
                print(f"{common_count}. {all_casts[i]["title"]} x {all_casts[j]["title"]}")
                print(f"\t{', '.join(common_cast)}")

def build_cast_lists():
    global all_casts, movies_list
    print("----Building Cast Lists-----")
    for i,m in enumerate(movies_list):

        cast_to_add =  {
                    "title":m["title"],
                    "cast":get_cast(m["id"])
                }

        all_casts.append(cast_to_add)
        print(f"{i+1}. {m["title"]:15s} ({len(cast_to_add['cast'])} actors)")



if __name__ == "__main__":
    
    #movie_search_list_build()

    build_cast_lists()
    print_common_casts()
    print_chicago_connections()






